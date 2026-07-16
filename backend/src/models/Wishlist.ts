import mongoose, { Schema } from 'mongoose';
import type { IWishlist } from '../types/models';

const wishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mobile: { type: Schema.Types.ObjectId, ref: 'Mobile', required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, mobile: 1 }, { unique: true });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
