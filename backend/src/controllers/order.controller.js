const Order = require('../models/Order');
const Mobile = require('../models/Mobile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const generateOrderNumber = require('../utils/generateOrderNumber');
const notificationService = require('../services/notification.service');
const { calculateDiscount, findValidCoupon } = require('./coupon.controller');
const { MOBILE_STATUS, ORDER_STATUS, DELIVERY_STATUS, DELIVERY_TYPE, NOTIFICATION_TYPE, ROLES } = require('../config/constants');

const DELIVERY_CHARGES = {
  [DELIVERY_TYPE.HOME_DELIVERY]: 199,
  [DELIVERY_TYPE.LOCAL_DELIVERY]: 49,
  [DELIVERY_TYPE.STORE_PICKUP]: 0,
};

const assertAccess = (order, user) => {
  const isParty =
    order.buyer.toString() === user._id.toString() ||
    order.seller.toString() === user._id.toString() ||
    user.role === ROLES.ADMIN;
  if (!isParty) throw ApiError.forbidden('You do not have access to this order');
};

const createOrder = asyncHandler(async (req, res) => {
  const { mobileId, deliveryType, deliveryAddress, couponCode } = req.body;

  const mobile = await Mobile.findById(mobileId);
  if (!mobile) throw ApiError.notFound('Listing not found');
  if (mobile.status !== MOBILE_STATUS.ACTIVE) throw ApiError.badRequest('This listing is not available for purchase');
  if (mobile.seller.toString() === req.user._id.toString()) throw ApiError.badRequest('You cannot buy your own listing');

  const itemPrice = mobile.price;
  const deliveryCharge = DELIVERY_CHARGES[deliveryType] ?? 0;
  let discount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await findValidCoupon(couponCode, req.user._id);
    discount = calculateDiscount(coupon, itemPrice + deliveryCharge);
  }

  const totalAmount = Math.max(itemPrice + deliveryCharge - discount, 0);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    buyer: req.user._id,
    seller: mobile.seller,
    mobile: mobile._id,
    pricing: { itemPrice, deliveryCharge, discount, couponCode: coupon?.code, totalAmount },
    deliveryType,
    deliveryAddress,
    trackingHistory: [{ status: DELIVERY_STATUS.PENDING, timestamp: new Date() }],
  });

  if (coupon) {
    const usage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
    if (usage) usage.count += 1;
    else coupon.usedBy.push({ user: req.user._id, count: 1 });
    coupon.usedCount += 1;
    await coupon.save();
  }

  await notificationService.notify({
    user: mobile.seller,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'New order received',
    message: `You have a new order for ${mobile.brand} ${mobile.model}`,
    data: { orderId: order._id },
  });

  new ApiResponse(201, order, 'Order placed successfully. Proceed to payment.').send(res);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('mobile')
    .populate('buyer', 'name avatar phone')
    .populate('seller', 'name avatar phone')
    .populate('payment');
  if (!order) throw ApiError.notFound('Order not found');
  assertAccess(order, req.user);

  new ApiResponse(200, order).send(res);
});

const listMyOrdersAsBuyer = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { buyer: req.user._id };
  if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('mobile', 'brand model images price').populate('seller', 'name avatar'),
    Order.countDocuments(filter),
  ]);

  new ApiResponse(200, orders, 'Orders fetched', buildMeta({ page, limit, total })).send(res);
});

const listMyOrdersAsSeller = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { seller: req.user._id };
  if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('mobile', 'brand model images price').populate('buyer', 'name avatar'),
    Order.countDocuments(filter),
  ]);

  new ApiResponse(200, orders, 'Orders fetched', buildMeta({ page, limit, total })).send(res);
});

const updateTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.seller.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only the seller can update delivery tracking');
  }

  const { status, location, note, trackingNumber, courierPartner } = req.body;
  order.pushTracking(status, location, note);
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierPartner) order.courierPartner = courierPartner;

  if (status === DELIVERY_STATUS.DELIVERED) {
    order.orderStatus = ORDER_STATUS.COMPLETED;
    await Mobile.updateOne({ _id: order.mobile }, { status: MOBILE_STATUS.SOLD, soldAt: new Date(), soldTo: order.buyer });
  }
  await order.save();

  await notificationService.notify({
    user: order.buyer,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Order update',
    message: `Your order ${order.orderNumber} is now ${status.replace(/_/g, ' ')}`,
    data: { orderId: order._id },
  });

  new ApiResponse(200, order, 'Tracking updated').send(res);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  assertAccess(order, req.user);

  if ([DELIVERY_STATUS.SHIPPED, DELIVERY_STATUS.OUT_FOR_DELIVERY, DELIVERY_STATUS.DELIVERED].includes(order.deliveryStatus)) {
    throw ApiError.badRequest('Order can no longer be cancelled at this stage');
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.pushTracking(DELIVERY_STATUS.CANCELLED, undefined, req.body.reason);
  order.cancelReason = req.body.reason;
  order.cancelledBy = req.user._id;
  await order.save();

  const notifyTarget = order.buyer.toString() === req.user._id.toString() ? order.seller : order.buyer;
  await notificationService.notify({
    user: notifyTarget,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Order cancelled',
    message: `Order ${order.orderNumber} was cancelled: ${req.body.reason}`,
    data: { orderId: order._id },
  });

  new ApiResponse(200, order, 'Order cancelled').send(res);
});

// --- Admin ---

const listAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;
  if (req.query.deliveryStatus) filter.deliveryStatus = req.query.deliveryStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyer', 'name').populate('seller', 'name').populate('mobile', 'brand model'),
    Order.countDocuments(filter),
  ]);

  new ApiResponse(200, orders, 'Orders fetched', buildMeta({ page, limit, total })).send(res);
});

module.exports = {
  createOrder,
  getOrder,
  listMyOrdersAsBuyer,
  listMyOrdersAsSeller,
  updateTracking,
  cancelOrder,
  listAllOrders,
};
