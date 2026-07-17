import type { Request, Response } from "express";
import type { Types } from "mongoose";
import Review from "../models/Review";
import Order from "../models/Order";
import User from "../models/User";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { uploadFile } from "../services/storage.service";
import { getPagination, buildMeta } from "../utils/pagination";
import { ORDER_STATUS } from "../config/constants";
import type { PaginationQuery } from "../types/common";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface SellerRatingStats {
  _id: Types.ObjectId;
  avg: number;
  count: number;
}

const recalculateSellerRating = async (
  sellerId: Types.ObjectId,
): Promise<void> => {
  const stats = await Review.aggregate<SellerRatingStats>([
    { $match: { seller: sellerId } },
    {
      $group: { _id: "$seller", avg: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await User.updateOne(
    { _id: sellerId },
    { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count },
  );
};

interface CreateReviewBody {
  orderId: string;
  rating: number;
  comment?: string;
}

export const createReview = async (
  req: Request<Record<string, never>, unknown, CreateReviewBody>,
  res: Response,
) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });
    }
    if (order.buyer.toString() !== req.user!._id.toString()) {
      return res
        .status(403)
        .json({
          flag: "error",
          message: "Only the buyer can review this order",
        });
    }
    if (order.orderStatus !== ORDER_STATUS.COMPLETED) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "You can only review completed orders",
        });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res
        .status(409)
        .json({
          flag: "error",
          message: "You have already reviewed this order",
        });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    let images: string[] = [];
    if (files.length) {
      images = await Promise.all(
        files.map((file) =>
          uploadFile(file.buffer, {
            folder: "reviews",
            originalName: file.originalname,
            mimetype: file.mimetype,
          }).then((r) => r.url),
        ),
      );
    }

    const review = await Review.create({
      order: orderId,
      buyer: req.user!._id,
      seller: order.seller,
      mobile: order.mobile,
      rating,
      comment,
      images,
    });

    await recalculateSellerRating(order.seller);

    res
      .status(201)
      .json({ flag: "success", data: review, message: "Review submitted" });
  } catch (error) {
    sendError(res, "submit review", error);
  }
};

interface SellerReplyBody {
  text: string;
}

export const sellerReply = async (
  req: Request<{ id: string }, unknown, SellerReplyBody>,
  res: Response,
) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ flag: "error", message: "Review not found" });
    }
    if (review.seller.toString() !== req.user!._id.toString()) {
      return res
        .status(403)
        .json({ flag: "error", message: "Not your review to reply to" });
    }

    review.sellerReply = { text: req.body.text, repliedAt: new Date() };
    await review.save();

    res
      .status(200)
      .json({ flag: "success", data: review, message: "Reply added" });
  } catch (error) {
    sendError(res, "reply to review", error);
  }
};

export const getSellerReviews = async (
  req: Request<{ id: string }, unknown, unknown, PaginationQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { seller: req.params.id };

    const [reviews, total, seller] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("buyer", "name avatar"),
      Review.countDocuments(filter),
      User.findById(req.params.id).select("ratingAvg ratingCount"),
    ]);

    res.status(200).json({
      flag: "success",
      data: reviews,
      message: "Reviews fetched",
      meta: {
        ...buildMeta({ page, limit, total }),
        ratingAvg: seller?.ratingAvg || 0,
        ratingCount: seller?.ratingCount || 0,
      },
    });
  } catch (error) {
    sendError(res, "fetch seller reviews", error);
  }
};

export const getMyReviews = async (
  req: Request<Record<string, never>, unknown, unknown, PaginationQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { buyer: req.user!._id };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("mobile", "brand model images")
        .populate("seller", "name avatar"),
      Review.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: reviews,
        message: "Reviews fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch my reviews", error);
  }
};

export const getMobileReviews = async (
  req: Request<{ id: string }, unknown, unknown, PaginationQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { mobile: req.params.id };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("buyer", "name avatar"),
      Review.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: reviews,
        message: "Reviews fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch mobile reviews", error);
  }
};
