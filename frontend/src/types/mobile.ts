import type { MobileCondition, MobileLocation } from './models';
import type { PaginationParams } from './api';

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
