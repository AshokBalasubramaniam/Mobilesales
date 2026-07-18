export const ROLES = Object.freeze({
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const);
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const MOBILE_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  SOLD: 'sold',
  REJECTED: 'rejected',
  REMOVED: 'removed',
} as const);
export type MobileStatus = (typeof MOBILE_STATUS)[keyof typeof MOBILE_STATUS];

export const MOBILE_CONDITION = Object.freeze({
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const);
export type MobileCondition = (typeof MOBILE_CONDITION)[keyof typeof MOBILE_CONDITION];

export const DELIVERY_TYPE = Object.freeze({
  HOME_DELIVERY: 'home_delivery',
  LOCAL_DELIVERY: 'local_delivery',
  STORE_PICKUP: 'store_pickup',
} as const);
export type DeliveryType = (typeof DELIVERY_TYPE)[keyof typeof DELIVERY_TYPE];

export const DELIVERY_STATUS = Object.freeze({
  PENDING: 'pending',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const);
export type DeliveryStatus = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];

export const ORDER_STATUS = Object.freeze({
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
} as const);
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const);
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = Object.freeze({
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  EMI: 'emi',
} as const);
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const MESSAGE_TYPE = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  OFFER: 'offer',
  LOCATION: 'location',
  VIDEO_CALL_EVENT: 'video_call_event',
  SYSTEM: 'system',
} as const);
export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

export const OFFER_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
} as const);
export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

export const VERIFICATION_STATUS = Object.freeze({
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const);
export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const REPORT_TYPE = Object.freeze({
  LISTING: 'listing',
  USER: 'user',
  CHAT: 'chat',
} as const);
export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];

export const REPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const);
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const DISPUTE_STATUS = Object.freeze({
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const);
export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

export const NOTIFICATION_TYPE = Object.freeze({
  ORDER: 'order',
  CHAT: 'chat',
  OFFER: 'offer',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  PRICE_DROP: 'price_drop',
  WISHLIST: 'wishlist',
  SYSTEM: 'system',
  VERIFICATION: 'verification',
} as const);
export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const COUPON_DISCOUNT_TYPE = Object.freeze({
  FLAT: 'flat',
  PERCENTAGE: 'percentage',
} as const);
export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPE)[keyof typeof COUPON_DISCOUNT_TYPE];

export const AUTH_PROVIDER = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
} as const);
export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];
