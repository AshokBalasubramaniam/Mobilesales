const ROLES = Object.freeze({
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
});

const MOBILE_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  SOLD: 'sold',
  REJECTED: 'rejected',
  REMOVED: 'removed',
});

const MOBILE_CONDITION = Object.freeze({
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
});

const DELIVERY_TYPE = Object.freeze({
  HOME_DELIVERY: 'home_delivery',
  LOCAL_DELIVERY: 'local_delivery',
  STORE_PICKUP: 'store_pickup',
});

const DELIVERY_STATUS = Object.freeze({
  PENDING: 'pending',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const ORDER_STATUS = Object.freeze({
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

const PAYMENT_METHOD = Object.freeze({
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  EMI: 'emi',
});

const MESSAGE_TYPE = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  OFFER: 'offer',
  LOCATION: 'location',
  VIDEO_CALL_EVENT: 'video_call_event',
  SYSTEM: 'system',
});

const OFFER_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
});

const VERIFICATION_STATUS = Object.freeze({
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const REPORT_TYPE = Object.freeze({
  LISTING: 'listing',
  USER: 'user',
  CHAT: 'chat',
});

const REPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
});

const DISPUTE_STATUS = Object.freeze({
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
});

const NOTIFICATION_TYPE = Object.freeze({
  ORDER: 'order',
  CHAT: 'chat',
  OFFER: 'offer',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  PRICE_DROP: 'price_drop',
  WISHLIST: 'wishlist',
  SYSTEM: 'system',
  VERIFICATION: 'verification',
});

const COUPON_DISCOUNT_TYPE = Object.freeze({
  FLAT: 'flat',
  PERCENTAGE: 'percentage',
});

const AUTH_PROVIDER = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
});

module.exports = {
  ROLES,
  MOBILE_STATUS,
  MOBILE_CONDITION,
  DELIVERY_TYPE,
  DELIVERY_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  MESSAGE_TYPE,
  OFFER_STATUS,
  VERIFICATION_STATUS,
  REPORT_TYPE,
  REPORT_STATUS,
  DISPUTE_STATUS,
  NOTIFICATION_TYPE,
  COUPON_DISCOUNT_TYPE,
  AUTH_PROVIDER,
};
