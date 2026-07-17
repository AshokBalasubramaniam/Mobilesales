import type { Request, Response } from "express";
import Wishlist from "../models/Wishlist";
import Mobile from "../models/Mobile";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import type { PaginationQuery } from "../types/common";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface AddToWishlistBody {
  mobileId: string;
}

export const addToWishlist = async (
  req: Request<Record<string, never>, unknown, AddToWishlistBody>,
  res: Response,
) => {
  try {
    const { mobileId } = req.body;

    const mobile = await Mobile.findById(mobileId);
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });

    const existing = await Wishlist.findOne({
      user: req.user!._id,
      mobile: mobileId,
    });
    if (existing)
      return res
        .status(409)
        .json({ flag: "error", message: "Listing already in wishlist" });

    await Wishlist.create({ user: req.user!._id, mobile: mobileId });
    await Mobile.updateOne({ _id: mobileId }, { $inc: { likesCount: 1 } });

    res
      .status(201)
      .json({ flag: "success", data: null, message: "Added to wishlist" });
  } catch (error) {
    sendError(res, "add to wishlist", error);
  }
};

export const removeFromWishlist = async (
  req: Request<{ mobileId: string }>,
  res: Response,
) => {
  try {
    const removed = await Wishlist.findOneAndDelete({
      user: req.user!._id,
      mobile: req.params.mobileId,
    });
    if (!removed)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found in wishlist" });

    await Mobile.updateOne(
      { _id: req.params.mobileId },
      { $inc: { likesCount: -1 } },
    );

    res
      .status(200)
      .json({ flag: "success", data: null, message: "Removed from wishlist" });
  } catch (error) {
    sendError(res, "remove from wishlist", error);
  }
};

export const getMyWishlist = async (
  req: Request<Record<string, never>, unknown, unknown, PaginationQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [items, total] = await Promise.all([
      Wishlist.find({ user: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "mobile",
          populate: {
            path: "seller",
            select: "name avatar sellerProfile.isVerified",
          },
        }),
      Wishlist.countDocuments({ user: req.user!._id }),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: items,
        message: "Wishlist fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch wishlist", error);
  }
};
