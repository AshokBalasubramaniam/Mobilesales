export const ROLES = { BUYER: 'buyer', SELLER: 'seller', ADMIN: 'admin' };

export const MOBILE_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  SOLD: 'sold',
  REJECTED: 'rejected',
  REMOVED: 'removed',
};

export const MOBILE_CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

export const DELIVERY_TYPES = [
  { value: 'home_delivery', label: 'Home Delivery' },
  { value: 'local_delivery', label: 'Local Delivery' },
  { value: 'store_pickup', label: 'Store Pickup' },
];

export const DELIVERY_STATUS_STEPS = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export const ORDER_STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  disputed: 'Disputed',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  OFFER: 'offer',
  LOCATION: 'location',
  VIDEO_CALL_EVENT: 'video_call_event',
  SYSTEM: 'system',
};

export const POPULAR_BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Vivo', 'Oppo', 'Realme'];

export const STORAGE_OPTIONS = [32, 64, 128, 256, 512];
export const RAM_OPTIONS = [2, 3, 4, 6, 8, 12, 16];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];
