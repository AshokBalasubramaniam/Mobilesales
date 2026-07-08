const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const { COUPON_DISCOUNT_TYPE } = require('../config/constants');

const calculateDiscount = (coupon, orderAmount) => {
  if (orderAmount < coupon.minOrderValue) {
    throw ApiError.badRequest(`Minimum order value for this coupon is ₹${coupon.minOrderValue}`);
  }

  let discount =
    coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
  return Math.min(Math.round(discount), orderAmount);
};

const findValidCoupon = async (code, userId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() }).select('+usedBy');
  if (!coupon) throw ApiError.notFound('Invalid coupon code');
  if (!coupon.isValidNow()) throw ApiError.badRequest('This coupon is no longer valid');

  const usage = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
  if (usage && usage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest('You have already used this coupon the maximum number of times');
  }

  return coupon;
};

const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await findValidCoupon(code, req.user._id);
  const discount = calculateDiscount(coupon, orderAmount);

  new ApiResponse(200, { discount, finalAmount: orderAmount - discount, coupon: { code: coupon.code, description: coupon.description } }).send(res);
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
  new ApiResponse(201, coupon, 'Coupon created').send(res);
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  new ApiResponse(200, coupon, 'Coupon updated').send(res);
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  new ApiResponse(200, null, 'Coupon deactivated').send(res);
});

const listCoupons = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coupon.countDocuments(filter),
  ]);

  new ApiResponse(200, coupons, 'Coupons fetched', buildMeta({ page, limit, total })).send(res);
});

const listActiveCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({ isActive: true, validFrom: { $lte: now }, validUntil: { $gte: now } }).select(
    'code description discountType discountValue minOrderValue maxDiscountAmount validUntil'
  );
  new ApiResponse(200, coupons).send(res);
});

module.exports = {
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
  listActiveCoupons,
  // internal helpers reused by the order module
  calculateDiscount,
  findValidCoupon,
};
