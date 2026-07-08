const Order = require('../models/Order');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');
const env = require('../config/env');
const notificationService = require('../services/notification.service');
const { getPagination, buildMeta } = require('../utils/pagination');
const { PAYMENT_STATUS, ORDER_STATUS, NOTIFICATION_TYPE, ROLES } = require('../config/constants');

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.buyer.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your order');
  if (order.paymentStatus === PAYMENT_STATUS.PAID) throw ApiError.badRequest('Order is already paid');

  const razorpayOrder = await paymentService.createOrder({
    amount: order.pricing.totalAmount,
    receipt: order.orderNumber,
  });

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
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

const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id: rpOrderId, razorpay_payment_id: rpPaymentId, razorpay_signature: rpSignature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  const payment = await Payment.findOne({ order: order._id, razorpayOrderId: rpOrderId });
  if (!payment) throw ApiError.notFound('Payment record not found for this order');

  const isValid = paymentService.verifySignature({
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

  await notificationService.notify({
    user: order.seller,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Payment received',
    message: `Payment received for order ${order.orderNumber}`,
    data: { orderId: order._id },
  });

  new ApiResponse(200, { order, payment }, 'Payment verified successfully').send(res);
});

const getMyPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };

  const [payments, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('order', 'orderNumber pricing orderStatus'),
    Payment.countDocuments(filter),
  ]);

  new ApiResponse(200, payments, 'Payments fetched', buildMeta({ page, limit, total })).send(res);
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('order');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (req.user.role !== ROLES.ADMIN && payment.order.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You cannot refund this payment');
  }
  if (payment.status !== 'captured') throw ApiError.badRequest('Only captured payments can be refunded');

  const result = await paymentService.refundPayment({ paymentId: payment.razorpayPaymentId, amount: payment.amount, isMock: payment.isMock });

  payment.status = 'refunded';
  payment.refund = { refundId: result.refundId, amount: payment.amount, reason: req.body.reason, status: 'processed', processedAt: new Date() };
  await payment.save();

  await Order.updateOne({ _id: payment.order._id }, { paymentStatus: PAYMENT_STATUS.REFUNDED });

  await notificationService.notify({
    user: payment.user,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Refund processed',
    message: `Your refund of ₹${payment.amount} has been processed`,
    data: { orderId: payment.order._id },
  });

  new ApiResponse(200, payment, 'Refund processed').send(res);
});

module.exports = { createPaymentOrder, verifyPayment, getMyPayments, refundPayment };
