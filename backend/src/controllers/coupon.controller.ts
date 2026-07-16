import type { Request, Response } from 'express';
import type { FilterQuery, Types } from 'mongoose';
import Coupon from '../models/Coupon';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getPagination, buildMeta } from '../utils/pagination';
import { COUPON_DISCOUNT_TYPE } from '../config/constants';
import type { ICoupon } from '../types/models';
import type { CouponDiscountType } from '../types/constants';

interface CreateCouponBody {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom?: Date;
  validUntil: Date;
  applicableFor?: 'all' | 'new_users';
}

type UpdateCouponBody = Partial<CreateCouponBody>;

interface ApplyCouponBody {
  code: string;
  orderAmount: number;
}

interface CouponListQuery {
  page?: string;
  limit?: string;
  isActive?: string;
}

export const calculateDiscount = (coupon: ICoupon, orderAmount: number): number => {
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

export const findValidCoupon = async (code: string, userId: Types.ObjectId): Promise<ICoupon> => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() }).select('+usedBy');
  if (!coupon) throw ApiError.notFound('Invalid coupon code');
  if (!coupon.isValidNow()) throw ApiError.badRequest('This coupon is no longer valid');

  const usage = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
  if (usage && usage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest('You have already used this coupon the maximum number of times');
  }

  return coupon;
};

export const applyCoupon = asyncHandler(async (req: Request<Record<string, never>, unknown, ApplyCouponBody>, res: Response) => {
  const { code, orderAmount } = req.body;
  const coupon = await findValidCoupon(code, req.user!._id);
  const discount = calculateDiscount(coupon, orderAmount);

  new ApiResponse(200, { discount, finalAmount: orderAmount - discount, coupon: { code: coupon.code, description: coupon.description } }).send(res);
});

export const createCoupon = asyncHandler(async (req: Request<Record<string, never>, unknown, CreateCouponBody>, res: Response) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user!._id });
  new ApiResponse(201, coupon, 'Coupon created').send(res);
});

export const updateCoupon = asyncHandler(async (req: Request<{ id: string }, unknown, UpdateCouponBody>, res: Response) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  new ApiResponse(200, coupon, 'Coupon updated').send(res);
});

export const deleteCoupon = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  new ApiResponse(200, null, 'Coupon deactivated').send(res);
});

export const listCoupons = asyncHandler(async (req: Request<Record<string, never>, unknown, unknown, CouponListQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter: FilterQuery<ICoupon> = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coupon.countDocuments(filter),
  ]);

  new ApiResponse(200, coupons, 'Coupons fetched', buildMeta({ page, limit, total })).send(res);
});

export const listActiveCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const coupons = await Coupon.find({ isActive: true, validFrom: { $lte: now }, validUntil: { $gte: now } }).select(
    'code description discountType discountValue minOrderValue maxDiscountAmount validUntil'
  );
  new ApiResponse(200, coupons).send(res);
});
