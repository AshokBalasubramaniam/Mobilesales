import axiosClient from './axiosClient';

export const usersApi = {
  updateProfile: (payload) => axiosClient.patch('/users/me', payload),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return axiosClient.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  addAddress: (payload) => axiosClient.post('/users/me/addresses', payload),
  removeAddress: (addressId) => axiosClient.delete(`/users/me/addresses/${addressId}`),
  setDefaultAddress: (addressId) => axiosClient.patch(`/users/me/addresses/${addressId}/default`),
  submitSellerVerification: (files) => {
    const form = new FormData();
    Object.entries(files).forEach(([key, file]) => file && form.append(key, file));
    return axiosClient.post('/users/seller/verification', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getPublicProfile: (id) => axiosClient.get(`/users/${id}/public`),

  // admin
  list: (params) => axiosClient.get('/users', { params }),
  getById: (id) => axiosClient.get(`/users/${id}`),
  block: (id, reason) => axiosClient.patch(`/users/${id}/block`, { reason }),
  unblock: (id) => axiosClient.patch(`/users/${id}/unblock`),
  reviewSellerVerification: (id, payload) => axiosClient.patch(`/users/${id}/seller-verification`, payload),
};
