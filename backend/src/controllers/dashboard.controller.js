const Mobile = require('../models/Mobile');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const Coupon = require('../models/Coupon');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { MOBILE_STATUS, ORDER_STATUS, REPORT_STATUS } = require('../config/constants');

const sellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [listingStats, orderStats, earningsAgg, chatRequests, pendingListings] = await Promise.all([
    Mobile.aggregate([
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
    Order.aggregate([{ $match: { seller: sellerId } }, { $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
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
    ordersByStatus: orderStats.reduce((acc, o) => ({ ...acc, [o._id]: o.count }), {}),
  }).send(res);
});

const buyerDashboard = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

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

const adminDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalListings, pendingApprovals, totalOrders, revenueAgg, fraudReports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    Mobile.countDocuments(),
    Mobile.countDocuments({ status: MOBILE_STATUS.PENDING_APPROVAL }),
    Order.countDocuments(),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, revenue: { $sum: '$amount' } } }]),
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

module.exports = { sellerDashboard, buyerDashboard, adminDashboard };
