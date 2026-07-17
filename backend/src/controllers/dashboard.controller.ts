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
  ORDER_STATUS,
  REPORT_STATUS,
} from "../config/constants";
import type { OrderStatus } from "../types/constants";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface ListingStatsAggResult {
  _id: null;
  totalViews: number;
  totalLikes: number;
  activeListings: number;
}

interface OrderStatusAggResult {
  _id: OrderStatus;
  count: number;
}

interface EarningsAggResult {
  _id: null;
  earnings: number;
  sales: number;
}

interface RevenueAggResult {
  _id: null;
  revenue: number;
}

export const sellerDashboard = async (req: Request, res: Response) => {
  try {
    const sellerId = req.user!._id;

    const [
      listingStats,
      orderStats,
      earningsAgg,
      chatRequests,
      pendingListings,
    ] = await Promise.all([
      Mobile.aggregate<ListingStatsAggResult>([
        { $match: { seller: sellerId } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalLikes: { $sum: "$likesCount" },
            activeListings: {
              $sum: {
                $cond: [{ $eq: ["$status", MOBILE_STATUS.ACTIVE] }, 1, 0],
              },
            },
          },
        },
      ]),
      Order.aggregate<OrderStatusAggResult>([
        { $match: { seller: sellerId } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
      Order.aggregate<EarningsAggResult>([
        { $match: { seller: sellerId, orderStatus: ORDER_STATUS.COMPLETED } },
        {
          $group: {
            _id: null,
            earnings: { $sum: "$pricing.totalAmount" },
            sales: { $sum: 1 },
          },
        },
      ]),
      Conversation.countDocuments({ participants: sellerId }),
      Mobile.countDocuments({
        seller: sellerId,
        status: MOBILE_STATUS.PENDING_APPROVAL,
      }),
    ]);

    res.status(200).json({
      flag: "success",
      data: {
        views: listingStats[0]?.totalViews || 0,
        likes: listingStats[0]?.totalLikes || 0,
        activeListings: listingStats[0]?.activeListings || 0,
        pendingListings,
        earnings: earningsAgg[0]?.earnings || 0,
        sales: earningsAgg[0]?.sales || 0,
        chatRequests,
        ordersByStatus: orderStats.reduce<Record<string, number>>(
          (acc, o) => ({ ...acc, [o._id]: o.count }),
          {},
        ),
      },
    });
  } catch (error) {
    sendError(res, "load seller dashboard", error);
  }
};

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
