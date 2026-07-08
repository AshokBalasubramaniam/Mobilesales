import axiosClient from './axiosClient';

export const reviewsApi = {
  create: (payload, images = []) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => form.append(key, value));
    images.forEach((img) => form.append('images', img));
    return axiosClient.post('/reviews', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  reply: (id, text) => axiosClient.patch(`/reviews/${id}/reply`, { text }),
  my: (params) => axiosClient.get('/reviews/my', { params }),
  bySeller: (sellerId, params) => axiosClient.get(`/reviews/seller/${sellerId}`, { params }),
  byMobile: (mobileId, params) => axiosClient.get(`/reviews/mobile/${mobileId}`, { params }),
};
