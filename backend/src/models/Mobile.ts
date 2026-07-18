import mongoose, { Schema } from 'mongoose';
import { MOBILE_STATUS, MOBILE_CONDITION } from '../config/constants';
import type {
  IImage,
  IVideo,
  IRepairHistoryItem,
  IPriceHistoryItem,
  IMobileLocation,
  IMobile,
} from '../types/models';

const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    key: { type: String },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const videoSchema = new Schema<IVideo>(
  {
    url: { type: String, required: true },
    key: { type: String },
    thumbnailUrl: { type: String },
  },
  { _id: false }
);

const repairHistoryItemSchema = new Schema<IRepairHistoryItem>(
  {
    issue: { type: String, required: true },
    date: { type: Date },
    description: { type: String },
  },
  { _id: false }
);

const priceHistoryItemSchema = new Schema<IPriceHistoryItem>(
  {
    price: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const locationSchema = new Schema<IMobileLocation>(
  {
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { _id: false }
);

const mobileSchema = new Schema<IMobile>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    color: { type: String },
    storage: { type: Number, required: true }, // GB
    ram: { type: Number, required: true }, // GB
    condition: { type: String, enum: Object.values(MOBILE_CONDITION), required: true },
    batteryHealth: { type: Number, min: 0, max: 100, required: true },

    price: { type: Number, required: true, index: true },
    mrp: { type: Number },
    negotiable: { type: Boolean, default: true },
    priceHistory: { type: [priceHistoryItemSchema], default: [] },
    aiSuggestedPrice: { type: Number },

    imei: { type: String, select: false },
    imeiLastFour: { type: String },
    imeiVerified: { type: Boolean, default: false },

    purchaseBillUrl: { type: String },
    warranty: {
      hasWarranty: { type: Boolean, default: false },
      expiryDate: { type: Date },
    },
    repairHistory: { type: [repairHistoryItemSchema], default: [] },
    originalBoxAvailable: { type: Boolean, default: false },
    chargerIncluded: { type: Boolean, default: false },
    accessoriesIncluded: { type: [String], default: [] },

    images: {
      type: [imageSchema],
      validate: [(arr: unknown[]) => arr.length <= 15, 'Maximum 15 images allowed'],
    },
    videos: { type: [videoSchema], default: [] },

    description: { type: String, maxlength: 5000 },

    location: { type: locationSchema, required: true },

    status: { type: String, enum: Object.values(MOBILE_STATUS), default: MOBILE_STATUS.PENDING_APPROVAL, index: true },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    isPremium: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },

    soldAt: { type: Date },
    soldTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

mobileSchema.index({ 'location.geo': '2dsphere' });
mobileSchema.index({ brand: 'text', model: 'text', description: 'text' });
mobileSchema.index({ status: 1, brand: 1, price: 1, storage: 1, ram: 1, batteryHealth: 1 });
mobileSchema.index({ 'location.state': 1, 'location.city': 1, 'location.pincode': 1 });
mobileSchema.index({ createdAt: -1 });

mobileSchema.pre('save', function trackPriceHistory(next) {
  if (this.isModified('price')) {
    this.priceHistory.push({ price: this.price, changedAt: new Date() });
  }
  if (this.isModified('imei') && this.imei) {
    this.imeiLastFour = this.imei.slice(-4);
  }
  next();
});

export default mongoose.model<IMobile>('Mobile', mobileSchema);
