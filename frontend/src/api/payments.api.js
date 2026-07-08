import axiosClient from './axiosClient';

export const paymentsApi = {
  createOrder: (orderId) => axiosClient.post('/payments/orders', { orderId }),
  verify: (payload) => axiosClient.post('/payments/verify', payload),
  myPayments: (params) => axiosClient.get('/payments/my', { params }),
  refund: (id, reason) => axiosClient.post(`/payments/${id}/refund`, { reason }),
};
