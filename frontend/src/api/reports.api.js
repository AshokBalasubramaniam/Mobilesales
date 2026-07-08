import axiosClient from './axiosClient';

export const reportsApi = {
  create: (payload) => axiosClient.post('/reports', payload),
  list: (params) => axiosClient.get('/reports', { params }),
  resolve: (id, payload) => axiosClient.patch(`/reports/${id}/resolve`, payload),

  createDispute: (payload) => axiosClient.post('/reports/disputes', payload),
  listDisputes: (params) => axiosClient.get('/reports/disputes', { params }),
  resolveDispute: (id, payload) => axiosClient.patch(`/reports/disputes/${id}/resolve`, payload),
};
