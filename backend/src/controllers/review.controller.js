const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const storageService = require('../services/storage.service');
const { getPagination, buildMeta } = require('../utils/pagination');
const { ORDER_STATUS } = require('../config/constants');

const recalculateSellerRating = async (sellerId) => {
  const stats = await Review.aggregate([
    { $match: { seller: sellerId } },
    { $group: { _id: '$seller', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await User.updateOne({ _id: sellerId }, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
};

const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.buyer.toString() !== req.user._id.toString()) throw ApiError.forbidden('Only the buyer can review this order');
  if (order.orderStatus !== ORDER_STATUS.COMPLETED) throw ApiError.badRequest('You can only review completed orders');

  const existing = await Review.findOne({ order: orderId });
  if (existing) throw ApiError.conflict('You have already reviewed this order');

  let images = [];
  if (req.files?.length) {
    images = await Promise.all(
      req.files.map((file) =>
        storageService
          .uploadFile(file.buffer, { folder: 'reviews', originalName: file.originalname, mimetype: file.mimetype })
          .then((r) => r.url)
      )
    );
  }

  const review = await Review.create({
    order: orderId,
    buyer: req.user._id,
    seller: order.seller,
    mobile: order.mobile,
    rating,
    comment,
    images,
  });

  await recalculateSellerRating(order.seller);

  new ApiResponse(201, review, 'Review submitted').send(res);
});

const sellerReply = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  if (review.seller.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your review to reply to');

  review.sellerReply = { text: req.body.text, repliedAt: new Date() };
  await review.save();

  new ApiResponse(200, review, 'Reply added').send(res);
});

const getSellerReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { seller: req.params.id };

  const [reviews, total, seller] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyer', 'name avatar'),
    Review.countDocuments(filter),
    User.findById(req.params.id).select('ratingAvg ratingCount'),
  ]);

  new ApiResponse(200, reviews, 'Reviews fetched', {
    ...buildMeta({ page, limit, total }),
    ratingAvg: seller?.ratingAvg || 0,
    ratingCount: seller?.ratingCount || 0,
  }).send(res);
});

const getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { buyer: req.user._id };

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('mobile', 'brand model images').populate('seller', 'name avatar'),
    Review.countDocuments(filter),
  ]);

  new ApiResponse(200, reviews, 'Reviews fetched', buildMeta({ page, limit, total })).send(res);
});

const getMobileReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { mobile: req.params.id };

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyer', 'name avatar'),
    Review.countDocuments(filter),
  ]);

  new ApiResponse(200, reviews, 'Reviews fetched', buildMeta({ page, limit, total })).send(res);
});

module.exports = { createReview, sellerReply, getSellerReviews, getMobileReviews, getMyReviews };
