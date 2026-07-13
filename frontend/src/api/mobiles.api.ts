import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Mobile, MobileCondition, MobileLocation, PriceHistoryItem } from '../types/models';

export interface MobileListParams extends PaginationParams {
  q?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: MobileCondition;
  storage?: number;
  ram?: number;
  state?: string;
  city?: string;
  verifiedSeller?: boolean;
  seller?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: 'newest' | 'price_low' | 'price_high' | 'popular';
}

export interface HomeSections {
  verified: Mobile[];
  premium: Mobile[];
  recentlyAdded: Mobile[];
  bestDeals: Mobile[];
  popularBrands: { brand: string; count: number }[];
}

export interface PriceSuggestionPayload {
  brand: string;
  model: string;
  storage: number;
  ram: number;
  condition: MobileCondition;
  batteryHealth: number;
  mrp?: number;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  basedOnComparables: number;
}

export interface CreateMobilePayload {
  brand: string;
  model: string;
  color?: string;
  storage: number;
  ram: number;
  condition: MobileCondition;
  batteryHealth: number;
  price: number;
  mrp?: number;
  negotiable?: boolean;
  imei?: string;
  warranty?: { hasWarranty: boolean; expiryDate?: string };
  repairHistory?: { issue: string }[];
  originalBoxAvailable?: boolean;
  chargerIncluded?: boolean;
  accessoriesIncluded?: string[];
  description?: string;
  location: MobileLocation;
}

export const mobilesApi = {
  list: (params?: MobileListParams) => axiosClient.get<ApiResponse<Mobile[]>>('/mobiles', { params }),
  getById: (id: string) => axiosClient.get<ApiResponse<Mobile>>(`/mobiles/${id}`),
  getPriceHistory: (id: string) => axiosClient.get<ApiResponse<PriceHistoryItem[]>>(`/mobiles/${id}/price-history`),
  homeSections: () => axiosClient.get<ApiResponse<HomeSections>>('/mobiles/home-sections'),
  mine: (params?: PaginationParams) => axiosClient.get<ApiResponse<Mobile[]>>('/mobiles/mine', { params }),
  create: (payload: CreateMobilePayload) => axiosClient.post<ApiResponse<Mobile>>('/mobiles', payload),
  update: (id: string, payload: Partial<CreateMobilePayload>) => axiosClient.patch<ApiResponse<Mobile>>(`/mobiles/${id}`, payload),
  remove: (id: string) => axiosClient.delete<ApiResponse<null>>(`/mobiles/${id}`),
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return axiosClient.post<ApiResponse<Mobile>>(`/mobiles/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadVideo: (id: string, file: File) => {
    const form = new FormData();
    form.append('video', file);
    return axiosClient.post<ApiResponse<Mobile>>(`/mobiles/${id}/video`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadPurchaseBill: (id: string, file: File) => {
    const form = new FormData();
    form.append('bill', file);
    return axiosClient.post<ApiResponse<Mobile>>(`/mobiles/${id}/purchase-bill`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  suggestPrice: (payload: PriceSuggestionPayload) => axiosClient.post<ApiResponse<PriceSuggestion>>('/mobiles/price-suggestion', payload),

  // admin
  pendingApprovals: (params?: PaginationParams) => axiosClient.get<ApiResponse<Mobile[]>>('/mobiles/admin/pending', { params }),
  approve: (id: string) => axiosClient.patch<ApiResponse<Mobile>>(`/mobiles/admin/${id}/approve`),
  reject: (id: string, reason: string) => axiosClient.patch<ApiResponse<Mobile>>(`/mobiles/admin/${id}/reject`, { reason }),
  verifyImei: (id: string, verified: boolean) => axiosClient.patch<ApiResponse<Mobile>>(`/mobiles/admin/${id}/verify-imei`, { verified }),
};
