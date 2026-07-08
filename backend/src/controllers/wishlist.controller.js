const Wishlist = require('../models/Wishlist');
const Mobile = require('../models/Mobile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

const addToWishlist = asyncHandler(async (req, res) => {
  const { mobileId } = req.body;

  const mobile = await Mobile.findById(mobileId);
  if (!mobile) throw ApiError.notFound('Listing not found');

  const existing = await Wishlist.findOne({ user: req.user._id, mobile: mobileId });
  if (existing) throw ApiError.conflict('Listing already in wishlist');

  await Wishlist.create({ user: req.user._id, mobile: mobileId });
  await Mobile.updateOne({ _id: mobileId }, { $inc: { likesCount: 1 } });

  new ApiResponse(201, null, 'Added to wishlist').send(res);
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const removed = await Wishlist.findOneAndDelete({ user: req.user._id, mobile: req.params.mobileId });
  if (!removed) throw ApiError.notFound('Listing not found in wishlist');

  await Mobile.updateOne({ _id: req.params.mobileId }, { $inc: { likesCount: -1 } });

  new ApiResponse(200, null, 'Removed from wishlist').send(res);
});

const getMyWishlist = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [items, total] = await Promise.all([
    Wishlist.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'mobile', populate: { path: 'seller', select: 'name avatar sellerProfile.isVerified' } }),
    Wishlist.countDocuments({ user: req.user._id }),
  ]);

  new ApiResponse(200, items, 'Wishlist fetched', buildMeta({ page, limit, total })).send(res);
});

module.exports = { addToWishlist, removeFromWishlist, getMyWishlist };
