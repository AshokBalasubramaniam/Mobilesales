import type { Request, Response } from "express";
import Order from "../models/Order";
import Payment from "../models/Payment";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { PAYMENT_STATUS } from "../config/constants";
import {
  getEmailFromAddress,
  setEmailFromAddress,
} from "../services/settings.service";

interface SumAggResult {
  _id: null;
  total: number;
}

interface DailySalesAggResult {
  _id: string;
  totalSales: number;
  orders: number;
}

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

export const revenueDashboard = async (_req: Request, res: Response) => {
  try {
    const [totalRevenueAgg, refundedAgg, pendingAgg] = await Promise.all([
      Payment.aggregate<SumAggResult>([
        { $match: { status: "captured" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate<SumAggResult>([
        { $match: { status: "refunded" } },
        { $group: { _id: null, total: { $sum: "$refund.amount" } } },
      ]),
      Order.countDocuments({ paymentStatus: PAYMENT_STATUS.PENDING }),
    ]);

    res.status(200).json({
      flag: "success",
      data: {
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        totalRefunded: refundedAgg[0]?.total || 0,
        pendingPayments: pendingAgg,
        netRevenue:
          (totalRevenueAgg[0]?.total || 0) - (refundedAgg[0]?.total || 0),
      },
    });
  } catch (error) {
    sendError(res, "load revenue dashboard", error);
  }
};

export const salesAnalytics = async (_req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const monthsSince = new Date();
    monthsSince.setMonth(monthsSince.getMonth() - 12);

    const [dailySales, monthlySales] = await Promise.all([
      Order.aggregate<DailySalesAggResult>([
        {
          $match: {
            createdAt: { $gte: since },
            paymentStatus: PAYMENT_STATUS.PAID,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalSales: { $sum: "$pricing.totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate<DailySalesAggResult>([
        {
          $match: {
            createdAt: { $gte: monthsSince },
            paymentStatus: PAYMENT_STATUS.PAID,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalSales: { $sum: "$pricing.totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res
      .status(200)
      .json({ flag: "success", data: { dailySales, monthlySales } });
  } catch (error) {
    sendError(res, "load sales analytics", error);
  }
};

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const emailFrom = await getEmailFromAddress();
    res.status(200).json({ flag: "success", data: { emailFrom } });
  } catch (error) {
    sendError(res, "load settings", error);
  }
};

export const updateSettings = async (
  req: Request<Record<string, never>, unknown, { emailFrom: string }>,
  res: Response,
) => {
  try {
    const emailFrom = await setEmailFromAddress(req.body.emailFrom);
    res.status(200).json({
      flag: "success",
      data: { emailFrom },
      message: "Settings updated",
    });
  } catch (error) {
    sendError(res, "update settings", error);
  }
};
