import axiosClient from './axiosClient';

export const dashboardApi = {
  seller: () => axiosClient.get('/dashboard/seller'),
  buyer: () => axiosClient.get('/dashboard/buyer'),
  admin: () => axiosClient.get('/dashboard/admin'),
};

export const adminApi = {
  revenue: () => axiosClient.get('/admin/revenue'),
  salesAnalytics: () => axiosClient.get('/admin/analytics/sales'),
};
