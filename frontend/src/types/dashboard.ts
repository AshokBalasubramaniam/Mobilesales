import type { OrderStatus } from './models';

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
