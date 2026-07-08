const mongoose = require('mongoose');
const { MESSAGE_TYPE, OFFER_STATUS } = require('../config/constants');

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: Object.values(MESSAGE_TYPE), default: MESSAGE_TYPE.TEXT },
    content: { type: String, trim: true },

    mediaUrl: { type: String },
    mediaDuration: { type: Number },

    offer: {
      amount: { type: Number },
      status: { type: String, enum: Object.values(OFFER_STATUS), default: OFFER_STATUS.PENDING },
    },

    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },

    callEvent: {
      event: { type: String, enum: ['started', 'ended', 'missed', 'declined'] },
      durationSeconds: { type: Number },
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
