import mongoose, { Schema } from 'mongoose';
import type { IAuthEvent } from '../types/models';

const authEventSchema = new Schema<IAuthEvent>(
  {
    type: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    email: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Bounds collection growth: 90 days is enough for incident investigation
// without keeping every login attempt forever.
authEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<IAuthEvent>('AuthEvent', authEventSchema);
