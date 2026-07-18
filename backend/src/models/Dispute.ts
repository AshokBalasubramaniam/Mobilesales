import mongoose, { Schema } from 'mongoose';
import { DISPUTE_STATUS } from '../config/constants';
import type { IDispute } from '../types/models';

const disputeSchema = new Schema<IDispute>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, maxlength: 3000 },
    evidenceUrls: { type: [String], default: [] },

    status: { type: String, enum: Object.values(DISPUTE_STATUS), default: DISPUTE_STATUS.OPEN, index: true },
    resolution: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IDispute>('Dispute', disputeSchema);
