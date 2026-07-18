import mongoose, { Schema } from 'mongoose';
import { DELIVERY_TYPE, DELIVERY_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../config/constants';
import type { DeliveryStatus } from '../types/constants';
import type { ITrackingEvent, IOrder, IOrderMethods, OrderModel } from '../types/models';

const trackingEventSchema = new Schema<ITrackingEvent>(
  {
    status: { type: String, enum: Object.values(DELIVERY_STATUS), required: true },
    location: { type: String },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder, OrderModel, IOrderMethods>(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mobile: { type: Schema.Types.ObjectId, ref: 'Mobile', required: true },

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
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },

    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PLACED, index: true },
    cancelReason: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

orderSchema.methods.pushTracking = function pushTracking(status: DeliveryStatus, location?: string, note?: string): void {
  this.deliveryStatus = status;
  this.trackingHistory.push({ status, location, note, timestamp: new Date() });
};

export default mongoose.model<IOrder, OrderModel>('Order', orderSchema);
