const mongoose = require('mongoose');
const { DELIVERY_TYPE, DELIVERY_STATUS, ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

const trackingEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(DELIVERY_STATUS), required: true },
    location: { type: String },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mobile: { type: mongoose.Schema.Types.ObjectId, ref: 'Mobile', required: true },

    pricing: {
      itemPrice: { type: Number, required: true },
      deliveryCharge: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      couponCode: { type: String },
      totalAmount: { type: Number, required: true },
    },

    deliveryType: { type: String, enum: Object.values(DELIVERY_TYPE), required: true },
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    deliveryStatus: { type: String, enum: Object.values(DELIVERY_STATUS), default: DELIVERY_STATUS.PENDING },
    trackingNumber: { type: String },
    courierPartner: { type: String },
    trackingHistory: { type: [trackingEventSchema], default: [] },

    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PLACED, index: true },
    cancelReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

orderSchema.methods.pushTracking = function pushTracking(status, location, note) {
  this.deliveryStatus = status;
  this.trackingHistory.push({ status, location, note, timestamp: new Date() });
};

module.exports = mongoose.model('Order', orderSchema);
