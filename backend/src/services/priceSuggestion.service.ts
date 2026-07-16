/**
 * Heuristic "AI" price suggestion engine. Estimates a fair resale price from
 * the listing's own attributes and, when available, the median price of
 * similar active listings already on the platform — no external ML service
 * required. Swap this out for a trained model later without touching callers.
 */
import Mobile from '../models/Mobile';
import { MOBILE_STATUS, MOBILE_CONDITION } from '../config/constants';
import type { MobileCondition } from '../types/constants';

const CONDITION_MULTIPLIER: Record<MobileCondition, number> = {
  [MOBILE_CONDITION.EXCELLENT]: 1.0,
  [MOBILE_CONDITION.GOOD]: 0.88,
  [MOBILE_CONDITION.FAIR]: 0.72,
  [MOBILE_CONDITION.POOR]: 0.55,
};

const median = (numbers: number[]): number | null => {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

export interface SuggestPriceArgs {
  brand: string;
  model: string;
  storage: number;
  ram: number;
  condition: MobileCondition;
  batteryHealth: number;
  mrp?: number;
}

export interface SuggestPriceResult {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  basedOnComparables: number;
}

export const suggestPrice = async ({ brand, model, storage, ram, condition, batteryHealth, mrp }: SuggestPriceArgs): Promise<SuggestPriceResult> => {
  const comparable = await Mobile.find({
    brand,
    model,
    status: MOBILE_STATUS.ACTIVE,
  })
    .select('price storage ram')
    .limit(50)
    .lean();

  const comparablePrices = comparable
    .filter((m) => m.storage === storage && m.ram === ram)
    .map((m) => m.price);

  const conditionFactor = CONDITION_MULTIPLIER[condition] ?? 0.8;
  const batteryFactor = 0.7 + (Math.min(Math.max(batteryHealth, 0), 100) / 100) * 0.3;

  let basePrice: number;
  const marketMedian = median(comparablePrices);
  if (marketMedian) {
    basePrice = marketMedian;
  } else if (mrp) {
    basePrice = mrp * 0.55;
  } else {
    basePrice = 8000 + storage * 40 + ram * 300;
  }

  const suggested = Math.round((basePrice * conditionFactor * batteryFactor) / 50) * 50;

  return {
    suggestedPrice: suggested,
    priceRange: { min: Math.round(suggested * 0.9), max: Math.round(suggested * 1.1) },
    basedOnComparables: comparablePrices.length,
  };
};
