import mongoose, { Schema } from 'mongoose';
import type { IReview } from '../types/models';

const reviewSchema = new Schema<IReview>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mobile: { type: Schema.Types.ObjectId, ref: 'Mobile', required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 2000 },
    images: { type: [String], default: [] },

    sellerReply: {
      text: { type: String },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

reviewSchema.index({ buyer: 1, order: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
