import mongoose, { Schema } from 'mongoose';
import type { IConversation } from '../types/models';

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    mobile: { type: Schema.Types.ObjectId, ref: 'Mobile' },

    lastMessage: {
      text: { type: String },
      type: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date },
    },

    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    isBlocked: { type: Boolean, default: false },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, mobile: 1 }, { unique: true, partialFilterExpression: { mobile: { $type: 'objectId' } } });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
