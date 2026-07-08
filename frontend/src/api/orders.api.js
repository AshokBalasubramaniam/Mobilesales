import axiosClient from './axiosClient';

export const ordersApi = {
  create: (payload) => axiosClient.post('/orders', payload),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  myOrdersAsBuyer: (params) => axiosClient.get('/orders/my', { params }),
  myOrdersAsSeller: (params) => axiosClient.get('/orders/selling', { params }),
  updateTracking: (id, payload) => axiosClient.patch(`/orders/${id}/tracking`, payload),
  cancel: (id, reason) => axiosClient.patch(`/orders/${id}/cancel`, { reason }),

  // admin
  listAll: (params) => axiosClient.get('/orders/admin/all', { params }),
};
