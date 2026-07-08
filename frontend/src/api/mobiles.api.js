import axiosClient from './axiosClient';

export const mobilesApi = {
  list: (params) => axiosClient.get('/mobiles', { params }),
  getById: (id) => axiosClient.get(`/mobiles/${id}`),
  getPriceHistory: (id) => axiosClient.get(`/mobiles/${id}/price-history`),
  homeSections: () => axiosClient.get('/mobiles/home-sections'),
  mine: (params) => axiosClient.get('/mobiles/mine', { params }),
  create: (payload) => axiosClient.post('/mobiles', payload),
  update: (id, payload) => axiosClient.patch(`/mobiles/${id}`, payload),
  remove: (id) => axiosClient.delete(`/mobiles/${id}`),
  uploadImages: (id, files) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return axiosClient.post(`/mobiles/${id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadVideo: (id, file) => {
    const form = new FormData();
    form.append('video', file);
    return axiosClient.post(`/mobiles/${id}/video`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadPurchaseBill: (id, file) => {
    const form = new FormData();
    form.append('bill', file);
    return axiosClient.post(`/mobiles/${id}/purchase-bill`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  suggestPrice: (payload) => axiosClient.post('/mobiles/price-suggestion', payload),

  // admin
  pendingApprovals: (params) => axiosClient.get('/mobiles/admin/pending', { params }),
  approve: (id) => axiosClient.patch(`/mobiles/admin/${id}/approve`),
  reject: (id, reason) => axiosClient.patch(`/mobiles/admin/${id}/reject`, { reason }),
  verifyImei: (id, verified) => axiosClient.patch(`/mobiles/admin/${id}/verify-imei`, { verified }),
};
