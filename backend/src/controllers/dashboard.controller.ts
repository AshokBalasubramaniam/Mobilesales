import type { Request, Response } from "express";
import Mobile from "../models/Mobile";
import Order from "../models/Order";
import Wishlist from "../models/Wishlist";
import Notification from "../models/Notification";
import Review from "../models/Review";
import Conversation from "../models/Conversation";
import Coupon from "../models/Coupon";
import Payment from "../models/Payment";
import User from "../models/User";
import Report from "../models/Report";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import {
  MOBILE_STATUS,
  REPORT_STATUS,
} from "../config/constants";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface RevenueAggResult {
  _id: null;
  revenue: number;
}

export const buyerDashboard = async (req: Request, res: Response) => {
  try {
    const buyerId = req.user!._id;

    const [
      orderCount,
      wishlistCount,
      unreadNotifications,
      reviewCount,
      chatCount,
      activeCoupons,
    ] = await Promise.all([
      Order.countDocuments({ buyer: buyerId }),
      Wishlist.countDocuments({ user: buyerId }),
      Notification.countDocuments({ user: buyerId, isRead: false }),
      Review.countDocuments({ buyer: buyerId }),
      Conversation.countDocuments({ participants: buyerId }),
      Coupon.countDocuments({
        isActive: true,
        validUntil: { $gte: new Date() },
      }),
    ]);

    res.status(200).json({
      flag: "success",
      data: {
        orders: orderCount,
        wishlist: wishlistCount,
        unreadNotifications,
        reviews: reviewCount,
        chats: chatCount,
        activeCoupons,
      },
    });
  } catch (error) {
    sendError(res, "load buyer dashboard", error);
  }
};

export const adminDashboard = async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalListings,
      pendingApprovals,
      totalOrders,
      revenueAgg,
      fraudReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      Mobile.countDocuments(),
      Mobile.countDocuments({ status: MOBILE_STATUS.PENDING_APPROVAL }),
      Order.countDocuments(),
      Payment.aggregate<RevenueAggResult>([
        { $match: { status: "captured" } },
        { $group: { _id: null, revenue: { $sum: "$amount" } } },
      ]),
      Report.countDocuments({ status: REPORT_STATUS.PENDING }),
    ]);

    res.status(200).json({
      flag: "success",
      data: {
        totalUsers,
        totalSellers,
        totalListings,
        pendingApprovals,
        totalOrders,
        revenue: revenueAgg[0]?.revenue || 0,
        fraudReports,
      },
    });
  } catch (error) {
    sendError(res, "load admin dashboard", error);
  }
};
