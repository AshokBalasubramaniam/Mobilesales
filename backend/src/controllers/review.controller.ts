import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import Review from '../models/Review';
import Order from '../models/Order';
import User from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { uploadFile } from '../services/storage.service';
import { getPagination, buildMeta } from '../utils/pagination';
import { ORDER_STATUS } from '../config/constants';
import type { PaginationQuery } from '../types/common';

interface SellerRatingStats {
  _id: Types.ObjectId;
  avg: number;
  count: number;
}

const recalculateSellerRating = async (sellerId: Types.ObjectId): Promise<void> => {
  const stats = await Review.aggregate<SellerRatingStats>([
    { $match: { seller: sellerId } },
    { $group: { _id: '$seller', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await User.updateOne({ _id: sellerId }, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
};

interface CreateReviewBody {
  orderId: string;
  rating: number;
  comment?: string;
}

export const createReview = asyncHandler(async (req: Request<Record<string, never>, unknown, CreateReviewBody>, res: Response) => {
  const { orderId, rating, comment } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.buyer.toString() !== req.user!._id.toString()) throw ApiError.forbidden('Only the buyer can review this order');
  if (order.orderStatus !== ORDER_STATUS.COMPLETED) throw ApiError.badRequest('You can only review completed orders');

  const existing = await Review.findOne({ order: orderId });
  if (existing) throw ApiError.conflict('You have already reviewed this order');

  const files = Array.isArray(req.files) ? req.files : [];
  let images: string[] = [];
  if (files.length) {
    images = await Promise.all(
      files.map((file) =>
        uploadFile(file.buffer, { folder: 'reviews', originalName: file.originalname, mimetype: file.mimetype }).then((r) => r.url)
      )
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

  new ApiResponse(201, review, 'Review submitted').send(res);
});

interface SellerReplyBody {
  text: string;
}

export const sellerReply = asyncHandler(async (req: Request<{ id: string }, unknown, SellerReplyBody>, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  if (review.seller.toString() !== req.user!._id.toString()) throw ApiError.forbidden('Not your review to reply to');

  review.sellerReply = { text: req.body.text, repliedAt: new Date() };
  await review.save();

  new ApiResponse(200, review, 'Reply added').send(res);
});

export const getSellerReviews = asyncHandler(async (req: Request<{ id: string }, unknown, unknown, PaginationQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { seller: req.params.id };

  const [reviews, total, seller] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyer', 'name avatar'),
    Review.countDocuments(filter),
    User.findById(req.params.id).select('ratingAvg ratingCount'),
  ]);

  new ApiResponse(200, reviews, 'Reviews fetched', {
    ...buildMeta({ page, limit, total }),
    ratingAvg: seller?.ratingAvg || 0,
    ratingCount: seller?.ratingCount || 0,
  }).send(res);
});

export const getMyReviews = asyncHandler(async (req: Request<Record<string, never>, unknown, unknown, PaginationQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { buyer: req.user!._id };

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('mobile', 'brand model images').populate('seller', 'name avatar'),
    Review.countDocuments(filter),
  ]);

  new ApiResponse(200, reviews, 'Reviews fetched', buildMeta({ page, limit, total })).send(res);
});

export const getMobileReviews = asyncHandler(async (req: Request<{ id: string }, unknown, unknown, PaginationQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { mobile: req.params.id };

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyer', 'name avatar'),
    Review.countDocuments(filter),
  ]);

  new ApiResponse(200, reviews, 'Reviews fetched', buildMeta({ page, limit, total })).send(res);
});
