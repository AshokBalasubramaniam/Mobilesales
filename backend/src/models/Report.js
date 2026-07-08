const mongoose = require('mongoose');
const { REPORT_TYPE, REPORT_STATUS } = require('../config/constants');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, enum: Object.values(REPORT_TYPE), required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    description: { type: String, maxlength: 2000 },

    status: { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.PENDING, index: true },
    adminNote: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
