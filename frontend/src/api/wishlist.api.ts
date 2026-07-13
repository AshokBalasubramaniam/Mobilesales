import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Wishlist } from '../types/models';

export const wishlistApi = {
  list: (params?: PaginationParams) => axiosClient.get<ApiResponse<Wishlist[]>>('/wishlist', { params }),
  add: (mobileId: string) => axiosClient.post<ApiResponse<Wishlist>>('/wishlist', { mobileId }),
  remove: (mobileId: string) => axiosClient.delete<ApiResponse<null>>(`/wishlist/${mobileId}`),
};
