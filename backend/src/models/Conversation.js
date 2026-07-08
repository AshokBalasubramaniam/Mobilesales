const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    mobile: { type: mongoose.Schema.Types.ObjectId, ref: 'Mobile' },

    lastMessage: {
      text: { type: String },
      type: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date },
    },

    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    isBlocked: { type: Boolean, default: false },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, mobile: 1 }, { unique: true, partialFilterExpression: { mobile: { $type: 'objectId' } } });

module.exports = mongoose.model('Conversation', conversationSchema);
