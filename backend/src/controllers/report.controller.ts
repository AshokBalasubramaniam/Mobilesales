import type { Request, Response } from "express";
import Report from "../models/Report";
import Dispute from "../models/Dispute";
import Order from "../models/Order";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { notify } from "../services/notification.service";
import { getPagination, buildMeta } from "../utils/pagination";
import {
  REPORT_STATUS,
  DISPUTE_STATUS,
  ORDER_STATUS,
  NOTIFICATION_TYPE,
} from "../config/constants";
import type {
  ReportType,
  ReportStatus,
  DisputeStatus,
} from "../types/constants";
import type { IDispute, IOrder } from "../types/models";
import type { Populated, PaginationQuery } from "../types/common";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

// --- Reports (listings / users / chats) ---

interface CreateReportBody {
  reportType: ReportType;
  targetId: string;
  reason: string;
  description?: string;
}

export const createReport = async (
  req: Request<Record<string, never>, unknown, CreateReportBody>,
  res: Response,
) => {
  try {
    const report = await Report.create({
      ...req.body,
      reportedBy: req.user!._id,
    });
    res
      .status(201)
      .json({ flag: "success", data: report, message: "Report submitted" });
  } catch (error) {
    sendError(res, "submit report", error);
  }
};

interface ListReportsQuery extends PaginationQuery {
  status?: ReportStatus;
  reportType?: ReportType;
}

export const listReports = async (
  req: Request<Record<string, never>, unknown, unknown, ListReportsQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: { status?: ReportStatus; reportType?: ReportType } = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.reportType) filter.reportType = req.query.reportType;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reportedBy", "name email"),
      Report.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: reports,
        message: "Reports fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch reports", error);
  }
};

interface ResolveReportBody {
  status: ReportStatus;
  adminNote?: string;
}

export const resolveReport = async (
  req: Request<{ id: string }, unknown, ResolveReportBody>,
  res: Response,
) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res
        .status(404)
        .json({ flag: "error", message: "Report not found" });
    }

    report.status = req.body.status;
    report.adminNote = req.body.adminNote;
    if (
      (
        [REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED] as ReportStatus[]
      ).includes(req.body.status)
    ) {
      report.resolvedBy = req.user!._id;
      report.resolvedAt = new Date();
    }
    await report.save();

    res
      .status(200)
      .json({ flag: "success", data: report, message: "Report updated" });
  } catch (error) {
    sendError(res, "update report", error);
  }
};

// --- Disputes (order-level) ---

interface CreateDisputeBody {
  orderId: string;
  reason: string;
  description?: string;
}

export const createDispute = async (
  req: Request<Record<string, never>, unknown, CreateDisputeBody>,
  res: Response,
) => {
  try {
    const { orderId, reason, description } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });
    }
    const isParty = [order.buyer.toString(), order.seller.toString()].includes(
      req.user!._id.toString(),
    );
    if (!isParty) {
      return res
        .status(403)
        .json({ flag: "error", message: "You are not part of this order" });
    }

    const dispute = await Dispute.create({
      order: orderId,
      raisedBy: req.user!._id,
      reason,
      description,
    });

    order.orderStatus = ORDER_STATUS.DISPUTED;
    await order.save();

    res
      .status(201)
      .json({ flag: "success", data: dispute, message: "Dispute raised" });
  } catch (error) {
    sendError(res, "raise dispute", error);
  }
};

interface ListDisputesQuery extends PaginationQuery {
  status?: DisputeStatus;
}

export const listDisputes = async (
  req: Request<Record<string, never>, unknown, unknown, ListDisputesQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: { status?: DisputeStatus } = {};
    if (req.query.status) filter.status = req.query.status;

    const [disputes, total] = await Promise.all([
      Dispute.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order")
        .populate("raisedBy", "name email"),
      Dispute.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: disputes,
        message: "Disputes fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch disputes", error);
  }
};

interface ResolveDisputeBody {
  status: DisputeStatus;
  resolution?: string;
}

export const resolveDispute = async (
  req: Request<{ id: string }, unknown, ResolveDisputeBody>,
  res: Response,
) => {
  try {
    const dispute = (await Dispute.findById(req.params.id).populate(
      "order",
    )) as Populated<IDispute, { order: IOrder }> | null;
    if (!dispute) {
      return res
        .status(404)
        .json({ flag: "error", message: "Dispute not found" });
    }

    dispute.status = req.body.status;
    dispute.resolution = req.body.resolution;
    if (req.body.status !== DISPUTE_STATUS.IN_REVIEW) {
      dispute.resolvedBy = req.user!._id;
      dispute.resolvedAt = new Date();
    }
    await dispute.save();

    if (req.body.status === DISPUTE_STATUS.RESOLVED) {
      await Order.updateOne(
        { _id: dispute.order._id },
        { orderStatus: ORDER_STATUS.COMPLETED },
      );
    } else if (req.body.status === DISPUTE_STATUS.REJECTED) {
      await Order.updateOne(
        { _id: dispute.order._id },
        { orderStatus: ORDER_STATUS.CONFIRMED },
      );
    }

    await notify({
      user: dispute.raisedBy,
      type: NOTIFICATION_TYPE.SYSTEM,
      title: "Dispute update",
      message: `Your dispute has been marked as ${req.body.status}`,
      data: { disputeId: dispute._id },
    });

    res
      .status(200)
      .json({ flag: "success", data: dispute, message: "Dispute updated" });
  } catch (error) {
    sendError(res, "update dispute", error);
  }
};
