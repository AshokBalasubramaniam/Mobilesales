import type { Request, Response } from "express";
import Order from "../models/Order";
import Payment from "../models/Payment";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import {
  createOrder as createRazorpayOrder,
  verifySignature,
  refundPayment as processRefund,
} from "../services/payment.service";
import env from "../config/env";
import { notify } from "../services/notification.service";
import { getPagination, buildMeta } from "../utils/pagination";
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  NOTIFICATION_TYPE,
  ROLES,
} from "../config/constants";
import type { IOrder, IPayment } from "../types/models";
import type { Populated, PaginationQuery } from "../types/common";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface CreatePaymentOrderBody {
  orderId: string;
}

export const createPaymentOrder = async (
  req: Request<Record<string, never>, unknown, CreatePaymentOrderBody>,
  res: Response,
) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });
    if (order.buyer.toString() !== req.user!._id.toString())
      return res.status(403).json({ flag: "error", message: "Not your order" });
    if (order.paymentStatus === PAYMENT_STATUS.PAID)
      return res
        .status(400)
        .json({ flag: "error", message: "Order is already paid" });

    const razorpayOrder = await createRazorpayOrder({
      amount: order.pricing.totalAmount,
      receipt: order.orderNumber,
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.user!._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.pricing.totalAmount,
      isMock: razorpayOrder.isMock,
    });

    order.payment = payment._id;
    await order.save();

    res.status(201).json({
      flag: "success",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.razorpay.keyId || null,
        isMock: razorpayOrder.isMock,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    sendError(res, "create payment order", error);
  }
};

interface VerifyPaymentBody {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const verifyPayment = async (
  req: Request<Record<string, never>, unknown, VerifyPaymentBody>,
  res: Response,
) => {
  try {
    const {
      orderId,
      razorpay_order_id: rpOrderId,
      razorpay_payment_id: rpPaymentId,
      razorpay_signature: rpSignature,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });

    const payment = await Payment.findOne({
      order: order._id,
      razorpayOrderId: rpOrderId,
    });
    if (!payment)
      return res
        .status(404)
        .json({
          flag: "error",
          message: "Payment record not found for this order",
        });

    const isValid = verifySignature({
      orderId: rpOrderId,
      paymentId: rpPaymentId,
      signature: rpSignature,
      isMock: payment.isMock,
    });

    if (!isValid) {
      payment.status = "failed";
      await payment.save();
      order.paymentStatus = PAYMENT_STATUS.FAILED;
      await order.save();
      return res
        .status(400)
        .json({ flag: "error", message: "Payment verification failed" });
    }

    payment.razorpayPaymentId = rpPaymentId;
    payment.razorpaySignature = rpSignature;
    payment.status = "captured";
    await payment.save();

    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.orderStatus = ORDER_STATUS.CONFIRMED;
    await order.save();

    await notify({
      user: order.seller,
      type: NOTIFICATION_TYPE.ORDER,
      title: "Payment received",
      message: `Payment received for order ${order.orderNumber}`,
      data: { orderId: order._id },
    });

    res
      .status(200)
      .json({
        flag: "success",
        data: { order, payment },
        message: "Payment verified successfully",
      });
  } catch (error) {
    sendError(res, "verify payment", error);
  }
};

export const getMyPayments = async (
  req: Request<Record<string, never>, unknown, unknown, PaginationQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { user: req.user!._id };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber pricing orderStatus"),
      Payment.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: payments,
        message: "Payments fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch payments", error);
  }
};

interface RefundPaymentBody {
  reason?: string;
}

export const refundPayment = async (
  req: Request<{ id: string }, unknown, RefundPaymentBody>,
  res: Response,
) => {
  try {
    const payment = (await Payment.findById(req.params.id).populate(
      "order",
    )) as Populated<IPayment, { order: IOrder }> | null;
    if (!payment)
      return res
        .status(404)
        .json({ flag: "error", message: "Payment not found" });
    if (
      req.user!.role !== ROLES.ADMIN &&
      payment.order.seller.toString() !== req.user!._id.toString()
    ) {
      return res
        .status(403)
        .json({ flag: "error", message: "You cannot refund this payment" });
    }
    if (payment.status !== "captured")
      return res
        .status(400)
        .json({
          flag: "error",
          message: "Only captured payments can be refunded",
        });

    const result = await processRefund({
      paymentId: payment.razorpayPaymentId!,
      amount: payment.amount,
      isMock: payment.isMock,
    });

    payment.status = "refunded";
    payment.refund = {
      refundId: result.refundId,
      amount: payment.amount,
      reason: req.body.reason,
      status: "processed",
      processedAt: new Date(),
    };
    await payment.save();

    await Order.updateOne(
      { _id: payment.order._id },
      { paymentStatus: PAYMENT_STATUS.REFUNDED },
    );

    await notify({
      user: payment.user,
      type: NOTIFICATION_TYPE.ORDER,
      title: "Refund processed",
      message: `Your refund of ₹${payment.amount} has been processed`,
      data: { orderId: payment.order._id },
    });

    res
      .status(200)
      .json({ flag: "success", data: payment, message: "Refund processed" });
  } catch (error) {
    sendError(res, "process refund", error);
  }
};
