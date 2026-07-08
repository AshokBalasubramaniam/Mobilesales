const Order = require('../models/Order');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { PAYMENT_STATUS } = require('../config/constants');

const revenueDashboard = asyncHandler(async (req, res) => {
  const [totalRevenueAgg, refundedAgg, pendingAgg] = await Promise.all([
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: 'refunded' } }, { $group: { _id: null, total: { $sum: '$refund.amount' } } }]),
    Order.countDocuments({ paymentStatus: PAYMENT_STATUS.PENDING }),
  ]);

  new ApiResponse(200, {
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    totalRefunded: refundedAgg[0]?.total || 0,
    pendingPayments: pendingAgg,
    netRevenue: (totalRevenueAgg[0]?.total || 0) - (refundedAgg[0]?.total || 0),
  }).send(res);
});

const salesAnalytics = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const monthsSince = new Date();
  monthsSince.setMonth(monthsSince.getMonth() - 12);

  const [dailySales, monthlySales] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, paymentStatus: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$pricing.totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: monthsSince }, paymentStatus: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalSales: { $sum: '$pricing.totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  new ApiResponse(200, { dailySales, monthlySales }).send(res);
});

module.exports = { revenueDashboard, salesAnalytics };
