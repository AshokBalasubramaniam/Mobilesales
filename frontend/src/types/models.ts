// Domain types mirroring backend Mongoose schemas (backend/src/models/*.js).
// ObjectId fields are serialized as strings over the wire; Date fields as ISO strings.

export type Role = "buyer" | "seller" | "admin";
export type AuthProvider = "local" | "google";
export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

export type MobileCondition = "excellent" | "good" | "fair" | "poor";
export type MobileStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "sold"
  | "rejected"
  | "removed";

export type DeliveryType = "home_delivery" | "local_delivery" | "store_pickup";
export type DeliveryStatus =
  | "pending"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "disputed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "emi";

export type MessageType =
  | "text"
  | "image"
  | "voice"
  | "offer"
  | "location"
  | "video_call_event"
  | "system";
export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";
export type CallEvent = "started" | "ended" | "missed" | "declined";

export type ReportType = "listing" | "user" | "chat";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
export type DisputeStatus = "open" | "in_review" | "resolved" | "rejected";

export type NotificationType =
  | "order"
  | "chat"
  | "offer"
  | "listing_approved"
  | "listing_rejected"
  | "price_drop"
  | "wishlist"
  | "system"
  | "verification";

export type CouponDiscountType = "flat" | "percentage";
export type CouponApplicableFor = "all" | "new_users";

export interface Address {
  _id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface SellerProfile {
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  documents?: {
    aadhaarUrl?: string;
    panUrl?: string;
    selfieUrl?: string;
    purchaseBillUrl?: string;
  };
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  addresses: Address[];
  sellerProfile: SellerProfile;
  ratingAvg: number;
  ratingCount: number;
  isBlocked: boolean;
  blockReason?: string;
  lastLoginAt?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MobileImage {
  url: string;
  key?: string;
  isPrimary: boolean;
  order: number;
}

export interface MobileVideo {
  url: string;
  key?: string;
  thumbnailUrl?: string;
}

export interface RepairHistoryItem {
  issue: string;
  date?: string;
  description?: string;
}

export interface PriceHistoryItem {
  price: number;
  changedAt: string;
}

export interface MobileLocation {
  state: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface Mobile {
  _id: string;
  seller: string | Pick<User, "_id" | "name" | "avatar" | "sellerProfile">;
  brand: string;
  model: string;
  color?: string;
  storage: number;
  ram: number;
  condition: MobileCondition;
  batteryHealth: number;
  price: number;
  mrp?: number;
  negotiable: boolean;
  priceHistory: PriceHistoryItem[];
  aiSuggestedPrice?: number;
  imei?: string;
  imeiLastFour?: string;
  imeiVerified: boolean;
  purchaseBillUrl?: string;
  warranty: { hasWarranty: boolean; expiryDate?: string };
  repairHistory: RepairHistoryItem[];
  originalBoxAvailable: boolean;
  chargerIncluded: boolean;
  accessoriesIncluded: string[];
  images: MobileImage[];
  videos: MobileVideo[];
  description?: string;
  location: MobileLocation;
  status: MobileStatus;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  isPremium: boolean;
  isFeatured: boolean;
  views: number;
  likesCount: number;
  soldAt?: string;
  soldTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationLastMessage {
  text?: string;
  type?: MessageType;
  sender?: string;
  sentAt?: string;
}

export interface Conversation {
  _id: string;
  participants:
    | Pick<User, "_id" | "name" | "avatar" | "email" | "role" | "lastSeen">[]
    | string[];
  otherParticipant?: Pick<User, "_id" | "name" | "avatar">;
  mobile?: Pick<
    Mobile,
    "_id" | "brand" | "model" | "images" | "price" | "status"
  >;
  lastMessage?: ConversationLastMessage;
  unreadCount?: number;
  isBlocked: boolean;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageOffer {
  amount?: number;
  status: OfferStatus;
}

export interface MessageLocation {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface MessageCallEvent {
  event?: CallEvent;
  durationSeconds?: number;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string | Pick<User, "_id" | "name" | "avatar" | "role">;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaDuration?: number;
  offer?: MessageOffer;
  location?: MessageLocation;
  callEvent?: MessageCallEvent;
  isRead: boolean;
  readAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  status: DeliveryStatus;
  location?: string;
  note?: string;
  timestamp: string;
}

export interface OrderPricing {
  itemPrice: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
}

export interface OrderDeliveryAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyer: string | Pick<User, "_id" | "name" | "avatar" | "email">;
  seller: string | Pick<User, "_id" | "name" | "avatar" | "email">;
  mobile: string | Pick<Mobile, "_id" | "brand" | "model" | "images" | "price">;
  pricing: OrderPricing;
  deliveryType: DeliveryType;
  deliveryAddress?: OrderDeliveryAddress;
  deliveryStatus: DeliveryStatus;
  trackingNumber?: string;
  courierPartner?: string;
  trackingHistory: TrackingEvent[];
  paymentStatus: PaymentStatus;
  payment?: string;
  orderStatus: OrderStatus;
  cancelReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableFor: CouponApplicableFor;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerReply {
  text?: string;
  repliedAt?: string;
}

export interface Review {
  _id: string;
  order: string;
  buyer: string | Pick<User, "_id" | "name" | "avatar">;
  seller: string;
  mobile: string;
  rating: number;
  comment?: string;
  images: string[];
  sellerReply?: SellerReply;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  _id: string;
  order: string | Pick<Order, "_id" | "orderNumber">;
  raisedBy: string | Pick<User, "_id" | "name">;
  reason: string;
  description?: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  _id: string;
  reportedBy: string | Pick<User, "_id" | "name">;
  reportType: ReportType;
  targetId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRefund {
  refundId?: string;
  amount?: number;
  reason?: string;
  status: "none" | "pending" | "processed" | "failed";
  processedAt?: string;
}

export interface Payment {
  _id: string;
  order: string;
  user: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  method?: PaymentMethod;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  refund?: PaymentRefund;
  invoiceUrl?: string;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  mobile: string | Mobile;
  createdAt: string;
  updatedAt: string;
}
