const mongoose = require('mongoose');
const { DISPUTE_STATUS } = require('../config/constants');

const disputeSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, maxlength: 3000 },
    evidenceUrls: { type: [String], default: [] },

    status: { type: String, enum: Object.values(DISPUTE_STATUS), default: DISPUTE_STATUS.OPEN, index: true },
    resolution: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
