const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mobile: { type: mongoose.Schema.Types.ObjectId, ref: 'Mobile', required: true },

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

module.exports = mongoose.model('Review', reviewSchema);
