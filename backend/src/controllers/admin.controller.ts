import type { Request, Response } from 'express';
import Order from '../models/Order';
import Payment from '../models/Payment';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import { PAYMENT_STATUS } from '../config/constants';

interface SumAggResult {
  _id: null;
  total: number;
}

interface DailySalesAggResult {
  _id: string;
  totalSales: number;
  orders: number;
}

export const revenueDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [totalRevenueAgg, refundedAgg, pendingAgg] = await Promise.all([
    Payment.aggregate<SumAggResult>([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate<SumAggResult>([{ $match: { status: 'refunded' } }, { $group: { _id: null, total: { $sum: '$refund.amount' } } }]),
    Order.countDocuments({ paymentStatus: PAYMENT_STATUS.PENDING }),
  ]);

  new ApiResponse(200, {
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    totalRefunded: refundedAgg[0]?.total || 0,
    pendingPayments: pendingAgg,
    netRevenue: (totalRevenueAgg[0]?.total || 0) - (refundedAgg[0]?.total || 0),
  }).send(res);
});

export const salesAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const monthsSince = new Date();
  monthsSince.setMonth(monthsSince.getMonth() - 12);

  const [dailySales, monthlySales] = await Promise.all([
    Order.aggregate<DailySalesAggResult>([
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
    Order.aggregate<DailySalesAggResult>([
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
