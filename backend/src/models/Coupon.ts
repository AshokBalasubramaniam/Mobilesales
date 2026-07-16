import mongoose, { Schema } from 'mongoose';
import { COUPON_DISCOUNT_TYPE } from '../config/constants';
import type { ICoupon, ICouponMethods, CouponModel } from '../types/models';

const couponSchema = new Schema<ICoupon, CouponModel, ICouponMethods>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: Object.values(COUPON_DISCOUNT_TYPE), required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableFor: { type: String, enum: ['all', 'new_users'], default: 'all' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    usedBy: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: 'User' },
          count: { type: Number, default: 0 },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

couponSchema.methods.isValidNow = function isValidNow(): boolean {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
};

export default mongoose.model<ICoupon, CouponModel>('Coupon', couponSchema);
