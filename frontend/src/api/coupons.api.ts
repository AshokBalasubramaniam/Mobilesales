import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Coupon, CouponApplicableFor, CouponDiscountType } from '../types/models';

export interface AppliedCoupon {
  code: string;
  discount: number;
}

export interface CouponPayload {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom?: string;
  validUntil: string;
  isActive?: boolean;
  applicableFor?: CouponApplicableFor;
}

export const couponsApi = {
  active: () => axiosClient.get<ApiResponse<Coupon[]>>('/coupons/active'),
  apply: (code: string, orderAmount: number) => axiosClient.post<ApiResponse<AppliedCoupon>>('/coupons/apply', { code, orderAmount }),

  list: (params?: PaginationParams) => axiosClient.get<ApiResponse<Coupon[]>>('/coupons', { params }),
  create: (payload: CouponPayload) => axiosClient.post<ApiResponse<Coupon>>('/coupons', payload),
  update: (id: string, payload: Partial<CouponPayload>) => axiosClient.patch<ApiResponse<Coupon>>(`/coupons/${id}`, payload),
  remove: (id: string) => axiosClient.delete<ApiResponse<null>>(`/coupons/${id}`),
};
