import type { Request, Response } from "express";
import type { FilterQuery, Types } from "mongoose";
import Coupon from "../models/Coupon";
import ApiError from "../utils/ApiError";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import { COUPON_DISCOUNT_TYPE } from "../config/constants";
import type { ICoupon } from "../types/models";
import type { CouponDiscountType } from "../types/constants";

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
  applicableFor?: "all" | "new_users";
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

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

export const calculateDiscount = (
  coupon: ICoupon,
  orderAmount: number,
): number => {
  if (orderAmount < coupon.minOrderValue) {
    throw ApiError.badRequest(
      `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
    );
  }

  let discount =
    coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount)
    discount = Math.min(discount, coupon.maxDiscountAmount);
  return Math.min(Math.round(discount), orderAmount);
};

export const findValidCoupon = async (
  code: string,
  userId: Types.ObjectId,
): Promise<ICoupon> => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() }).select(
    "+usedBy",
  );
  if (!coupon) throw ApiError.notFound("Invalid coupon code");
  if (!coupon.isValidNow())
    throw ApiError.badRequest("This coupon is no longer valid");

  const usage = coupon.usedBy.find(
    (u) => u.user.toString() === userId.toString(),
  );
  if (usage && usage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest(
      "You have already used this coupon the maximum number of times",
    );
  }

  return coupon;
};

export const applyCoupon = async (
  req: Request<Record<string, never>, unknown, ApplyCouponBody>,
  res: Response,
) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await findValidCoupon(code, req.user!._id);
    const discount = calculateDiscount(coupon, orderAmount);

    res.status(200).json({
      flag: "success",
      data: {
        discount,
        finalAmount: orderAmount - discount,
        coupon: { code: coupon.code, description: coupon.description },
      },
    });
  } catch (error) {
    sendError(res, "apply coupon", error);
  }
};

export const createCoupon = async (
  req: Request<Record<string, never>, unknown, CreateCouponBody>,
  res: Response,
) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      createdBy: req.user!._id,
    });
    res
      .status(201)
      .json({ flag: "success", data: coupon, message: "Coupon created" });
  } catch (error) {
    sendError(res, "create coupon", error);
  }
};

export const updateCoupon = async (
  req: Request<{ id: string }, unknown, UpdateCouponBody>,
  res: Response,
) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res
        .status(404)
        .json({ flag: "error", message: "Coupon not found" });
    }
    res
      .status(200)
      .json({ flag: "success", data: coupon, message: "Coupon updated" });
  } catch (error) {
    sendError(res, "update coupon", error);
  }
};

export const deleteCoupon = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!coupon) {
      return res
        .status(404)
        .json({ flag: "error", message: "Coupon not found" });
    }
    res
      .status(200)
      .json({ flag: "success", data: null, message: "Coupon deactivated" });
  } catch (error) {
    sendError(res, "deactivate coupon", error);
  }
};

export const listCoupons = async (
  req: Request<Record<string, never>, unknown, unknown, CouponListQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<ICoupon> = {};
    if (req.query.isActive !== undefined)
      filter.isActive = req.query.isActive === "true";

    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);

    res.status(200).json({
      flag: "success",
      data: coupons,
      message: "Coupons fetched",
      meta: buildMeta({ page, limit, total }),
    });
  } catch (error) {
    sendError(res, "list coupons", error);
  }
};

export const listActiveCoupons = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).select(
      "code description discountType discountValue minOrderValue maxDiscountAmount validUntil",
    );
    res.status(200).json({ flag: "success", data: coupons });
  } catch (error) {
    sendError(res, "list active coupons", error);
  }
};
