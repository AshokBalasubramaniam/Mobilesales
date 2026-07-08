import axiosClient from './axiosClient';

export const couponsApi = {
  active: () => axiosClient.get('/coupons/active'),
  apply: (code, orderAmount) => axiosClient.post('/coupons/apply', { code, orderAmount }),

  // admin
  list: (params) => axiosClient.get('/coupons', { params }),
  create: (payload) => axiosClient.post('/coupons', payload),
  update: (id, payload) => axiosClient.patch(`/coupons/${id}`, payload),
  remove: (id) => axiosClient.delete(`/coupons/${id}`),
};
