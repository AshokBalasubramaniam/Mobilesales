import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { DeliveryStatus, DeliveryType, Order } from '../types/models';

export interface CreateOrderPayload {
  mobileId: string;
  deliveryType: DeliveryType;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  couponCode?: string;
}

export interface UpdateTrackingPayload {
  status: DeliveryStatus;
  location?: string;
  note?: string;
  trackingNumber?: string;
  courierPartner?: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) => axiosClient.post<ApiResponse<Order>>('/orders', payload),
  getById: (id: string) => axiosClient.get<ApiResponse<Order>>(`/orders/${id}`),
  myOrdersAsBuyer: (params?: PaginationParams) => axiosClient.get<ApiResponse<Order[]>>('/orders/my', { params }),
  myOrdersAsSeller: (params?: PaginationParams) => axiosClient.get<ApiResponse<Order[]>>('/orders/selling', { params }),
  updateTracking: (id: string, payload: UpdateTrackingPayload) => axiosClient.patch<ApiResponse<Order>>(`/orders/${id}/tracking`, payload),
  cancel: (id: string, reason: string) => axiosClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),

  // admin
  listAll: (params?: PaginationParams) => axiosClient.get<ApiResponse<Order[]>>('/orders/admin/all', { params }),
};
