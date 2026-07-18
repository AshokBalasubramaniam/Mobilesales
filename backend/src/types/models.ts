import type { Document, Model, Types } from 'mongoose';
import type {
  Role,
  AuthProvider,
  VerificationStatus,
  MobileCondition,
  MobileStatus,
  DeliveryType,
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  MessageType,
  OfferStatus,
  NotificationType,
  ReportType,
  ReportStatus,
  DisputeStatus,
  CouponDiscountType,
} from './constants';

// ---------- User ----------

export interface IAddress {
  _id: Types.ObjectId;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IRefreshToken {
  token: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ISellerProfile {
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  documents: {
    aadhaarUrl?: string;
    panUrl?: string;
    selfieUrl?: string;
    purchaseBillUrl?: string;
  };
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

export interface IPasswordResetOtp {
  codeHash?: string;
  expiresAt?: Date;
  attempts: number;
}

export interface IUserOtp {
  codeHash?: string;
  purpose?: 'login' | 'phone_verify' | 'email_verify';
  expiresAt?: Date;
  attempts: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  avatar: string;
  authProvider: AuthProvider;
  googleId?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  passwordResetOtp?: IPasswordResetOtp;
  otp?: IUserOtp;
  addresses: Types.DocumentArray<IAddress>;
  sellerProfile: ISellerProfile;
  ratingAvg: number;
  ratingCount: number;
  isBlocked: boolean;
  blockReason?: string;
  refreshTokens: IRefreshToken[];
  lastLoginAt?: Date;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<IUser, 'password' | 'refreshTokens' | 'otp' | 'passwordResetOtp' | 'googleId'>;

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  toSafeJSON(): SafeUser;
}

export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

// ---------- Mobile ----------

export interface IImage {
  url: string;
  key?: string;
  isPrimary: boolean;
  order: number;
}

export interface IVideo {
  url: string;
  key?: string;
  thumbnailUrl?: string;
}

export interface IRepairHistoryItem {
  issue: string;
  date?: Date;
  description?: string;
}

export interface IPriceHistoryItem {
  price: number;
  changedAt: Date;
}

export interface IMobileLocation {
  state: string;
  city: string;
  pincode: string;
  geo: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IMobileWarranty {
  hasWarranty: boolean;
  expiryDate?: Date;
}

export interface IMobile extends Omit<Document, 'model'> {
  _id: Types.ObjectId;
  seller: Types.ObjectId;
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
  priceHistory: IPriceHistoryItem[];
  aiSuggestedPrice?: number;
  imei?: string;
  imeiLastFour?: string;
  imeiVerified: boolean;
  purchaseBillUrl?: string;
  warranty: IMobileWarranty;
  repairHistory: IRepairHistoryItem[];
  originalBoxAvailable: boolean;
  chargerIncluded: boolean;
  accessoriesIncluded: string[];
  images: Types.DocumentArray<IImage>;
  videos: Types.DocumentArray<IVideo>;
  description?: string;
  location: IMobileLocation;
  status: MobileStatus;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  isPremium: boolean;
  isFeatured: boolean;
  views: number;
  likesCount: number;
  soldAt?: Date;
  soldTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Order ----------

export interface ITrackingEvent {
  status: DeliveryStatus;
  location?: string;
  note?: string;
  timestamp: Date;
}

export interface IOrderPricing {
  itemPrice: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
}

export interface IOrderDeliveryAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  mobile: Types.ObjectId;
  pricing: IOrderPricing;
  deliveryType: DeliveryType;
  deliveryAddress?: IOrderDeliveryAddress;
  deliveryStatus: DeliveryStatus;
  trackingNumber?: string;
  courierPartner?: string;
  trackingHistory: ITrackingEvent[];
  paymentStatus: PaymentStatus;
  payment?: Types.ObjectId;
  orderStatus: OrderStatus;
  cancelReason?: string;
  cancelledBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderMethods {
  pushTracking(status: DeliveryStatus, location?: string, note?: string): void;
}

export type OrderModel = Model<IOrder, Record<string, never>, IOrderMethods>;

// ---------- Payment ----------

export type PaymentTxnStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type PaymentRefundStatus = 'none' | 'pending' | 'processed' | 'failed';

export interface IPaymentRefund {
  refundId?: string;
  amount?: number;
  reason?: string;
  status: PaymentRefundStatus;
  processedAt?: Date;
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  user: Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  method?: PaymentMethod;
  status: PaymentTxnStatus;
  refund?: IPaymentRefund;
  invoiceUrl?: string;
  isMock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Conversation ----------

export interface IConversationLastMessage {
  text?: string;
  type?: string;
  sender?: Types.ObjectId;
  sentAt?: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  mobile?: Types.ObjectId;
  lastMessage?: IConversationLastMessage;
  unreadCounts: Map<string, number>;
  isBlocked: boolean;
  blockedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Message ----------

export interface IMessageOffer {
  amount?: number;
  status: OfferStatus;
}

export interface IMessageLocation {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface IMessageCallEvent {
  event?: 'started' | 'ended' | 'missed' | 'declined';
  durationSeconds?: number;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaDuration?: number;
  offer?: IMessageOffer;
  location?: IMessageLocation;
  callEvent?: IMessageCallEvent;
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Notification ----------

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Review ----------

export interface IReviewSellerReply {
  text?: string;
  repliedAt?: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  mobile: Types.ObjectId;
  rating: number;
  comment?: string;
  images: string[];
  sellerReply?: IReviewSellerReply;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Wishlist ----------

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  mobile: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Coupon ----------

export interface ICouponUsage {
  user: Types.ObjectId;
  count: number;
}

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableFor: 'all' | 'new_users';
  createdBy?: Types.ObjectId;
  usedBy: ICouponUsage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICouponMethods {
  isValidNow(): boolean;
}

export type CouponModel = Model<ICoupon, Record<string, never>, ICouponMethods>;

// ---------- Dispute ----------

export interface IDispute extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  raisedBy: Types.ObjectId;
  reason: string;
  description?: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Report ----------

export interface IReport extends Document {
  _id: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reportType: ReportType;
  targetId: Types.ObjectId;
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNote?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Settings ----------

export interface ISettings extends Document {
  _id: Types.ObjectId;
  emailFrom: string;
  createdAt: Date;
  updatedAt: Date;
}
