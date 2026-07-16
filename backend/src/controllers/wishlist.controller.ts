import type { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import Mobile from '../models/Mobile';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getPagination, buildMeta } from '../utils/pagination';
import type { PaginationQuery } from '../types/common';

interface AddToWishlistBody {
  mobileId: string;
}

export const addToWishlist = asyncHandler(async (req: Request<Record<string, never>, unknown, AddToWishlistBody>, res: Response) => {
  const { mobileId } = req.body;

  const mobile = await Mobile.findById(mobileId);
  if (!mobile) throw ApiError.notFound('Listing not found');

  const existing = await Wishlist.findOne({ user: req.user!._id, mobile: mobileId });
  if (existing) throw ApiError.conflict('Listing already in wishlist');

  await Wishlist.create({ user: req.user!._id, mobile: mobileId });
  await Mobile.updateOne({ _id: mobileId }, { $inc: { likesCount: 1 } });

  new ApiResponse(201, null, 'Added to wishlist').send(res);
});

export const removeFromWishlist = asyncHandler(async (req: Request<{ mobileId: string }>, res: Response) => {
  const removed = await Wishlist.findOneAndDelete({ user: req.user!._id, mobile: req.params.mobileId });
  if (!removed) throw ApiError.notFound('Listing not found in wishlist');

  await Mobile.updateOne({ _id: req.params.mobileId }, { $inc: { likesCount: -1 } });

  new ApiResponse(200, null, 'Removed from wishlist').send(res);
});

export const getMyWishlist = asyncHandler(async (req: Request<Record<string, never>, unknown, unknown, PaginationQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);

  const [items, total] = await Promise.all([
    Wishlist.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'mobile', populate: { path: 'seller', select: 'name avatar sellerProfile.isVerified' } }),
    Wishlist.countDocuments({ user: req.user!._id }),
  ]);

  new ApiResponse(200, items, 'Wishlist fetched', buildMeta({ page, limit, total })).send(res);
});
