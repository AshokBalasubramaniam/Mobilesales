import type { Request, Response } from 'express';
import Order from '../models/Order';
import Payment from '../models/Payment';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { createOrder as createRazorpayOrder, verifySignature, refundPayment as processRefund } from '../services/payment.service';
import env from '../config/env';
import { notify } from '../services/notification.service';
import { getPagination, buildMeta } from '../utils/pagination';
import { PAYMENT_STATUS, ORDER_STATUS, NOTIFICATION_TYPE, ROLES } from '../config/constants';
import type { IOrder, IPayment } from '../types/models';
import type { Populated, PaginationQuery } from '../types/common';

interface CreatePaymentOrderBody {
  orderId: string;
}

export const createPaymentOrder = asyncHandler(async (req: Request<Record<string, never>, unknown, CreatePaymentOrderBody>, res: Response) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.buyer.toString() !== req.user!._id.toString()) throw ApiError.forbidden('Not your order');
  if (order.paymentStatus === PAYMENT_STATUS.PAID) throw ApiError.badRequest('Order is already paid');

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

  new ApiResponse(201, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: env.razorpay.keyId || null,
    isMock: razorpayOrder.isMock,
    paymentId: payment._id,
  }).send(res);
});

interface VerifyPaymentBody {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const verifyPayment = asyncHandler(async (req: Request<Record<string, never>, unknown, VerifyPaymentBody>, res: Response) => {
  const { orderId, razorpay_order_id: rpOrderId, razorpay_payment_id: rpPaymentId, razorpay_signature: rpSignature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  const payment = await Payment.findOne({ order: order._id, razorpayOrderId: rpOrderId });
  if (!payment) throw ApiError.notFound('Payment record not found for this order');

  const isValid = verifySignature({
    orderId: rpOrderId,
    paymentId: rpPaymentId,
    signature: rpSignature,
    isMock: payment.isMock,
  });

  if (!isValid) {
    payment.status = 'failed';
    await payment.save();
    order.paymentStatus = PAYMENT_STATUS.FAILED;
    await order.save();
    throw ApiError.badRequest('Payment verification failed');
  }

  payment.razorpayPaymentId = rpPaymentId;
  payment.razorpaySignature = rpSignature;
  payment.status = 'captured';
  await payment.save();

  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.orderStatus = ORDER_STATUS.CONFIRMED;
  await order.save();

  await notify({
    user: order.seller,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Payment received',
    message: `Payment received for order ${order.orderNumber}`,
    data: { orderId: order._id },
  });

  new ApiResponse(200, { order, payment }, 'Payment verified successfully').send(res);
});

export const getMyPayments = asyncHandler(async (req: Request<Record<string, never>, unknown, unknown, PaginationQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user!._id };

  const [payments, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('order', 'orderNumber pricing orderStatus'),
    Payment.countDocuments(filter),
  ]);

  new ApiResponse(200, payments, 'Payments fetched', buildMeta({ page, limit, total })).send(res);
});

interface RefundPaymentBody {
  reason?: string;
}

export const refundPayment = asyncHandler(async (req: Request<{ id: string }, unknown, RefundPaymentBody>, res: Response) => {
  const payment = (await Payment.findById(req.params.id).populate('order')) as Populated<IPayment, { order: IOrder }> | null;
  if (!payment) throw ApiError.notFound('Payment not found');
  if (req.user!.role !== ROLES.ADMIN && payment.order.seller.toString() !== req.user!._id.toString()) {
    throw ApiError.forbidden('You cannot refund this payment');
  }
  if (payment.status !== 'captured') throw ApiError.badRequest('Only captured payments can be refunded');

  const result = await processRefund({ paymentId: payment.razorpayPaymentId!, amount: payment.amount, isMock: payment.isMock });

  payment.status = 'refunded';
  payment.refund = { refundId: result.refundId, amount: payment.amount, reason: req.body.reason, status: 'processed', processedAt: new Date() };
  await payment.save();

  await Order.updateOne({ _id: payment.order._id }, { paymentStatus: PAYMENT_STATUS.REFUNDED });

  await notify({
    user: payment.user,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Refund processed',
    message: `Your refund of ₹${payment.amount} has been processed`,
    data: { orderId: payment.order._id },
  });

  new ApiResponse(200, payment, 'Refund processed').send(res);
});
