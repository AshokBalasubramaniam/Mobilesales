import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Payment } from '../types/models';

export interface RazorpayOrder {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  isMock: boolean;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  createOrder: (orderId: string) => axiosClient.post<ApiResponse<RazorpayOrder>>('/payments/orders', { orderId }),
  verify: (payload: VerifyPaymentPayload) => axiosClient.post<ApiResponse<Payment>>('/payments/verify', payload),
  myPayments: (params?: PaginationParams) => axiosClient.get<ApiResponse<Payment[]>>('/payments/my', { params }),
  refund: (id: string, reason: string) => axiosClient.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { reason }),
};
