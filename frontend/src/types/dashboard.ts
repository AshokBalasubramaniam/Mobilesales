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
