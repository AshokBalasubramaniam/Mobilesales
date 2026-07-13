import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { OrderStatus } from '../types/models';

export interface SellerDashboardStats {
  views: number;
  likes: number;
  activeListings: number;
  pendingListings: number;
  earnings: number;
  sales: number;
  chatRequests: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}

export interface BuyerDashboardStats {
  orders: number;
  wishlist: number;
  unreadNotifications: number;
  reviews: number;
  chats: number;
  activeCoupons: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalListings: number;
  pendingApprovals: number;
  totalOrders: number;
  revenue: number;
  fraudReports: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalRefunded: number;
  pendingPayments: number;
  netRevenue: number;
}

export interface SalesPoint {
  _id: string;
  totalSales: number;
  orders: number;
}

export interface SalesAnalytics {
  dailySales: SalesPoint[];
  monthlySales: SalesPoint[];
}

export const dashboardApi = {
  seller: () => axiosClient.get<ApiResponse<SellerDashboardStats>>('/dashboard/seller'),
  buyer: () => axiosClient.get<ApiResponse<BuyerDashboardStats>>('/dashboard/buyer'),
  admin: () => axiosClient.get<ApiResponse<AdminDashboardStats>>('/dashboard/admin'),
};

export const adminApi = {
  revenue: () => axiosClient.get<ApiResponse<RevenueStats>>('/admin/revenue'),
  salesAnalytics: () => axiosClient.get<ApiResponse<SalesAnalytics>>('/admin/analytics/sales'),
};
