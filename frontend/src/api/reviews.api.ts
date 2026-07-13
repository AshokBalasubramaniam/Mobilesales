import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Review } from '../types/models';

export interface CreateReviewPayload {
  order: string;
  mobile: string;
  seller: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  create: (payload: CreateReviewPayload, images: File[] = []) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => form.append(key, String(value)));
    images.forEach((img) => form.append('images', img));
    return axiosClient.post<ApiResponse<Review>>('/reviews', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  reply: (id: string, text: string) => axiosClient.patch<ApiResponse<Review>>(`/reviews/${id}/reply`, { text }),
  my: (params?: PaginationParams) => axiosClient.get<ApiResponse<Review[]>>('/reviews/my', { params }),
  bySeller: (sellerId: string, params?: PaginationParams) => axiosClient.get<ApiResponse<Review[]>>(`/reviews/seller/${sellerId}`, { params }),
  byMobile: (mobileId: string, params?: PaginationParams) => axiosClient.get<ApiResponse<Review[]>>(`/reviews/mobile/${mobileId}`, { params }),
};
