const mongoose = require('mongoose');
const { PAYMENT_METHOD } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String, select: false },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: Object.values(PAYMENT_METHOD) },

    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
    },

    refund: {
      refundId: { type: String },
      amount: { type: Number },
      reason: { type: String },
      status: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
      processedAt: { type: Date },
    },

    invoiceUrl: { type: String },
    isMock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
