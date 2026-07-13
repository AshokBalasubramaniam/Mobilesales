import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Address, User } from '../types/models';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface AddressPayload {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface ReviewSellerVerificationPayload {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export const usersApi = {
  updateProfile: (payload: UpdateProfilePayload) => axiosClient.patch<ApiResponse<User>>('/users/me', payload),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return axiosClient.post<ApiResponse<User>>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addAddress: (payload: AddressPayload) => axiosClient.post<ApiResponse<Address[]>>('/users/me/addresses', payload),
  removeAddress: (addressId: string) => axiosClient.delete<ApiResponse<Address[]>>(`/users/me/addresses/${addressId}`),
  setDefaultAddress: (addressId: string) => axiosClient.patch<ApiResponse<Address[]>>(`/users/me/addresses/${addressId}/default`),
  submitSellerVerification: <T extends Record<string, File | null | undefined>>(files: T) => {
    const form = new FormData();
    Object.entries(files).forEach(([key, file]) => file && form.append(key, file));
    return axiosClient.post<ApiResponse<User>>('/users/seller/verification', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPublicProfile: (id: string) => axiosClient.get<ApiResponse<User>>(`/users/${id}/public`),

  // admin
  list: (params?: PaginationParams) => axiosClient.get<ApiResponse<User[]>>('/users', { params }),
  getById: (id: string) => axiosClient.get<ApiResponse<User>>(`/users/${id}`),
  block: (id: string, reason: string) => axiosClient.patch<ApiResponse<User>>(`/users/${id}/block`, { reason }),
  unblock: (id: string) => axiosClient.patch<ApiResponse<User>>(`/users/${id}/unblock`),
  reviewSellerVerification: (id: string, payload: ReviewSellerVerificationPayload) =>
    axiosClient.patch<ApiResponse<User>>(`/users/${id}/seller-verification`, payload),
};
