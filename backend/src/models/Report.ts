import mongoose, { Schema } from 'mongoose';
import { REPORT_TYPE, REPORT_STATUS } from '../config/constants';
import type { IReport } from '../types/models';

const reportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, enum: Object.values(REPORT_TYPE), required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    description: { type: String, maxlength: 2000 },

    status: { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.PENDING, index: true },
    adminNote: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', reportSchema);
