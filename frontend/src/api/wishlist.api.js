import axiosClient from './axiosClient';

export const wishlistApi = {
  list: (params) => axiosClient.get('/wishlist', { params }),
  add: (mobileId) => axiosClient.post('/wishlist', { mobileId }),
  remove: (mobileId) => axiosClient.delete(`/wishlist/${mobileId}`),
};
