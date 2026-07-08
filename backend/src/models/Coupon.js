const mongoose = require('mongoose');
const { COUPON_DISCOUNT_TYPE } = require('../config/constants');

const couponSchema = new mongoose.Schema(
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedBy: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          count: { type: Number, default: 0 },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

couponSchema.methods.isValidNow = function isValidNow() {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
};

module.exports = mongoose.model('Coupon', couponSchema);
