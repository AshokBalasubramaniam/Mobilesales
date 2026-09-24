import type {
  DeliveryType,
  DeviceCategory,
  MobileStatus,
  OrderStatus,
  Role,
} from "../types/models";

export const ROLES: Record<"BUYER" | "SELLER" | "ADMIN", Role> = {
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
};

export const MOBILE_STATUS = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  ACTIVE: "active",
  SOLD: "sold",
  REJECTED: "rejected",
  REMOVED: "removed",
} as const;

// Sellers can only edit a listing before an admin approves it (mirrors the
// backend check in mobile.controller.ts#updateListing).
export const SELLER_EDITABLE_STATUSES: MobileStatus[] = [
  "draft",
  "pending_approval",
  "rejected",
];

export const MOBILE_CONDITIONS = ["excellent", "good", "fair", "poor"] as const;

export const DELIVERY_TYPES: { value: DeliveryType; label: string }[] = [
  { value: "home_delivery", label: "Home Delivery" },
  { value: "local_delivery", label: "Local Delivery" },
  { value: "store_pickup", label: "Store Pickup" },
];

export const DELIVERY_STATUS_STEPS = [
  "pending",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  disputed: "Disputed",
};

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VOICE: "voice",
  OFFER: "offer",
  LOCATION: "location",
  VIDEO_CALL_EVENT: "video_call_event",
  SYSTEM: "system",
} as const;

export const POPULAR_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Google",
  "Vivo",
  "Oppo",
  "Realme",
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Sony",
  "Canon",
];

export const BRANDS_BY_CATEGORY: Record<DeviceCategory, string[]> = {
  phone: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Google", "Vivo", "Oppo", "Realme", "Nothing", "Nokia"],
  laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus"],
  tablet: ["Apple", "Samsung", "Lenovo", "Xiaomi", "Realme"],
  smartwatch: ["Apple", "Samsung", "Noise", "boAt"],
  accessory: ["Anker", "boAt", "JBL", "Sony"],
  gaming: ["Sony", "Asus", "Microsoft", "Nintendo"],
  audio: ["Apple", "Sony", "JBL", "boAt"],
  camera: ["Canon", "Nikon", "Sony", "Fujifilm"],
};

export const DEVICE_CATEGORIES: {
  value: DeviceCategory;
  label: string;
  sublabel: string;
}[] = [
  { value: "phone", label: "Phones", sublabel: "Smartphones" },
  { value: "laptop", label: "Laptops", sublabel: "All Brands" },
  { value: "tablet", label: "Tablets", sublabel: "Top Tablets" },
  { value: "smartwatch", label: "Smartwatches", sublabel: "Wearables" },
  { value: "accessory", label: "Accessories", sublabel: "All Accessories" },
  { value: "gaming", label: "Gaming", sublabel: "Consoles & More" },
  { value: "audio", label: "Audio", sublabel: "Speakers & More" },
  { value: "camera", label: "Cameras", sublabel: "DSLR & More" },
];

// Categories where storage/ram/batteryHealth/imei are meaningful specs
export const STORAGE_RAM_CATEGORIES: DeviceCategory[] = ["phone", "laptop", "tablet"];
export const BATTERY_HEALTH_CATEGORIES: DeviceCategory[] = [
  "phone",
  "laptop",
  "tablet",
  "smartwatch",
];
export const IMEI_CATEGORIES: DeviceCategory[] = ["phone"];

export const STORAGE_OPTIONS = [32, 64, 128, 256, 512];
export const RAM_OPTIONS = [2, 3, 4, 6, 8, 12, 16];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];
