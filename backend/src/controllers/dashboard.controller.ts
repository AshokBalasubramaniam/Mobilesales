import type { Request, Response } from 'express';
import Mobile from '../models/Mobile';
import Order from '../models/Order';
import Wishlist from '../models/Wishlist';
import Notification from '../models/Notification';
import Review from '../models/Review';
import Conversation from '../models/Conversation';
import Coupon from '../models/Coupon';
import Payment from '../models/Payment';
import User from '../models/User';
import Report from '../models/Report';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import { MOBILE_STATUS, ORDER_STATUS, REPORT_STATUS } from '../config/constants';
import type { OrderStatus } from '../types/constants';

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

export const sellerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = req.user!._id;

  const [listingStats, orderStats, earningsAgg, chatRequests, pendingListings] = await Promise.all([
    Mobile.aggregate<ListingStatsAggResult>([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' },
          activeListings: { $sum: { $cond: [{ $eq: ['$status', MOBILE_STATUS.ACTIVE] }, 1, 0] } },
        },
      },
    ]),
    Order.aggregate<OrderStatusAggResult>([{ $match: { seller: sellerId } }, { $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate<EarningsAggResult>([
      { $match: { seller: sellerId, orderStatus: ORDER_STATUS.COMPLETED } },
      { $group: { _id: null, earnings: { $sum: '$pricing.totalAmount' }, sales: { $sum: 1 } } },
    ]),
    Conversation.countDocuments({ participants: sellerId }),
    Mobile.countDocuments({ seller: sellerId, status: MOBILE_STATUS.PENDING_APPROVAL }),
  ]);

  new ApiResponse(200, {
    views: listingStats[0]?.totalViews || 0,
    likes: listingStats[0]?.totalLikes || 0,
    activeListings: listingStats[0]?.activeListings || 0,
    pendingListings,
    earnings: earningsAgg[0]?.earnings || 0,
    sales: earningsAgg[0]?.sales || 0,
    chatRequests,
    ordersByStatus: orderStats.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o._id]: o.count }), {}),
  }).send(res);
});

export const buyerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = req.user!._id;

  const [orderCount, wishlistCount, unreadNotifications, reviewCount, chatCount, activeCoupons] = await Promise.all([
    Order.countDocuments({ buyer: buyerId }),
    Wishlist.countDocuments({ user: buyerId }),
    Notification.countDocuments({ user: buyerId, isRead: false }),
    Review.countDocuments({ buyer: buyerId }),
    Conversation.countDocuments({ participants: buyerId }),
    Coupon.countDocuments({ isActive: true, validUntil: { $gte: new Date() } }),
  ]);

  new ApiResponse(200, {
    orders: orderCount,
    wishlist: wishlistCount,
    unreadNotifications,
    reviews: reviewCount,
    chats: chatCount,
    activeCoupons,
  }).send(res);
});

export const adminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalSellers, totalListings, pendingApprovals, totalOrders, revenueAgg, fraudReports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    Mobile.countDocuments(),
    Mobile.countDocuments({ status: MOBILE_STATUS.PENDING_APPROVAL }),
    Order.countDocuments(),
    Payment.aggregate<RevenueAggResult>([{ $match: { status: 'captured' } }, { $group: { _id: null, revenue: { $sum: '$amount' } } }]),
    Report.countDocuments({ status: REPORT_STATUS.PENDING }),
  ]);

  new ApiResponse(200, {
    totalUsers,
    totalSellers,
    totalListings,
    pendingApprovals,
    totalOrders,
    revenue: revenueAgg[0]?.revenue || 0,
    fraudReports,
  }).send(res);
});
