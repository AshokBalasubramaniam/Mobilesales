const Mobile = require('../models/Mobile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const storageService = require('../services/storage.service');
const priceSuggestionService = require('../services/priceSuggestion.service');
const notificationService = require('../services/notification.service');
const { MOBILE_STATUS, ROLES, NOTIFICATION_TYPE } = require('../config/constants');

const toArray = (val) => (val === undefined ? undefined : Array.isArray(val) ? val : [val]);

const createListing = asyncHandler(async (req, res) => {
  const payload = { ...req.body, seller: req.user._id, status: MOBILE_STATUS.PENDING_APPROVAL };

  if (payload.location) {
    payload.location = {
      state: payload.location.state,
      city: payload.location.city,
      pincode: payload.location.pincode,
      geo: {
        type: 'Point',
        coordinates: [payload.location.lng || 0, payload.location.lat || 0],
      },
    };
  }

  const mobile = await Mobile.create(payload);
  new ApiResponse(201, mobile, 'Listing created and submitted for approval').send(res);
});

const uploadImages = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findOne({ _id: req.params.id, seller: req.user._id });
  if (!mobile) throw ApiError.notFound('Listing not found');
  if (!req.files?.length) throw ApiError.badRequest('No images uploaded');

  const uploaded = await Promise.all(
    req.files.map((file, idx) =>
      storageService
        .uploadFile(file.buffer, { folder: 'listings/images', originalName: file.originalname, mimetype: file.mimetype })
        .then(({ url, key }) => ({ url, key, isPrimary: mobile.images.length === 0 && idx === 0, order: mobile.images.length + idx }))
    )
  );

  mobile.images.push(...uploaded);
  await mobile.save();

  new ApiResponse(200, mobile.images, 'Images uploaded').send(res);
});

const uploadVideo = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findOne({ _id: req.params.id, seller: req.user._id });
  if (!mobile) throw ApiError.notFound('Listing not found');
  if (!req.file) throw ApiError.badRequest('No video uploaded');

  const { url, key } = await storageService.uploadFile(req.file.buffer, {
    folder: 'listings/videos',
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  mobile.videos.push({ url, key });
  await mobile.save();

  new ApiResponse(200, mobile.videos, 'Video uploaded').send(res);
});

const uploadPurchaseBill = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findOne({ _id: req.params.id, seller: req.user._id });
  if (!mobile) throw ApiError.notFound('Listing not found');
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { url } = await storageService.uploadFile(req.file.buffer, {
    folder: 'listings/bills',
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  mobile.purchaseBillUrl = url;
  await mobile.save();

  new ApiResponse(200, { purchaseBillUrl: url }, 'Purchase bill uploaded').send(res);
});

const updateListing = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findOne({ _id: req.params.id, seller: req.user._id });
  if (!mobile) throw ApiError.notFound('Listing not found');
  if (mobile.status === MOBILE_STATUS.SOLD) throw ApiError.badRequest('Cannot edit a sold listing');

  Object.assign(mobile, req.body);
  if (req.body.location) {
    mobile.location.state = req.body.location.state ?? mobile.location.state;
    mobile.location.city = req.body.location.city ?? mobile.location.city;
    mobile.location.pincode = req.body.location.pincode ?? mobile.location.pincode;
    if (req.body.location.lat !== undefined || req.body.location.lng !== undefined) {
      mobile.location.geo = {
        type: 'Point',
        coordinates: [req.body.location.lng ?? mobile.location.geo.coordinates[0], req.body.location.lat ?? mobile.location.geo.coordinates[1]],
      };
    }
  }
  mobile.status = MOBILE_STATUS.PENDING_APPROVAL; // edits require re-approval
  await mobile.save();

  new ApiResponse(200, mobile, 'Listing updated and resubmitted for approval').send(res);
});

const deleteListing = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findOne({ _id: req.params.id, seller: req.user._id });
  if (!mobile) throw ApiError.notFound('Listing not found');

  mobile.status = MOBILE_STATUS.REMOVED;
  await mobile.save();

  new ApiResponse(200, null, 'Listing removed').send(res);
});

const getListing = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findById(req.params.id).populate('seller', 'name avatar ratingAvg ratingCount sellerProfile.isVerified createdAt');
  if (!mobile) throw ApiError.notFound('Listing not found');

  const isOwner = req.user && mobile.seller._id.toString() === req.user._id.toString();
  if (mobile.status !== MOBILE_STATUS.ACTIVE && !isOwner && req.user?.role !== ROLES.ADMIN) {
    throw ApiError.notFound('Listing not found');
  }

  if (!isOwner) {
    Mobile.updateOne({ _id: mobile._id }, { $inc: { views: 1 } }).exec();
  }

  new ApiResponse(200, mobile).send(res);
});

const buildSearchFilter = (query) => {
  const filter = { status: MOBILE_STATUS.ACTIVE };

  const brand = toArray(query.brand);
  if (brand) filter.brand = { $in: brand.map((b) => new RegExp(`^${b}$`, 'i')) };
  if (query.model) filter.model = new RegExp(query.model, 'i');
  if (query.q) filter.$text = { $search: query.q };

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  const ram = toArray(query.ram);
  if (ram) filter.ram = { $in: ram.map(Number) };
  const storage = toArray(query.storage);
  if (storage) filter.storage = { $in: storage.map(Number) };

  if (query.minBatteryHealth) filter.batteryHealth = { $gte: Number(query.minBatteryHealth) };
  if (query.condition) filter.condition = query.condition;
  if (query.hasWarranty !== undefined) filter['warranty.hasWarranty'] = query.hasWarranty === 'true' || query.hasWarranty === true;
  if (query.verifiedImei !== undefined) filter.imeiVerified = query.verifiedImei === 'true' || query.verifiedImei === true;

  if (query.state) filter['location.state'] = new RegExp(`^${query.state}$`, 'i');
  if (query.city) filter['location.city'] = new RegExp(`^${query.city}$`, 'i');
  if (query.pincode) filter['location.pincode'] = query.pincode;

  return filter;
};

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { views: -1, likesCount: -1 },
};

const listListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildSearchFilter(req.query);

  let sellerIds = null;
  if (req.query.verifiedSeller !== undefined) {
    const verified = req.query.verifiedSeller === 'true' || req.query.verifiedSeller === true;
    sellerIds = await User.find({ 'sellerProfile.isVerified': verified }).distinct('_id');
    filter.seller = { $in: sellerIds };
  }
  if (req.query.seller) {
    filter.seller = req.query.seller;
  }

  let query;
  if (req.query.lat && req.query.lng) {
    const radiusMeters = (Number(req.query.radiusKm) || 25) * 1000;
    filter['location.geo'] = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(req.query.lng), Number(req.query.lat)] },
        $maxDistance: radiusMeters,
      },
    };
    query = Mobile.find(filter);
  } else {
    query = Mobile.find(filter).sort(SORT_MAP[req.query.sort] || SORT_MAP.newest);
  }

  const [mobiles, total] = await Promise.all([
    query.skip(skip).limit(limit).populate('seller', 'name avatar sellerProfile.isVerified ratingAvg'),
    Mobile.countDocuments(filter),
  ]);

  new ApiResponse(200, mobiles, 'Listings fetched', buildMeta({ page, limit, total })).send(res);
});

const getMyListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { seller: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [mobiles, total] = await Promise.all([
    Mobile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Mobile.countDocuments(filter),
  ]);

  new ApiResponse(200, mobiles, 'Your listings', buildMeta({ page, limit, total })).send(res);
});

const suggestPrice = asyncHandler(async (req, res) => {
  const suggestion = await priceSuggestionService.suggestPrice(req.body);
  new ApiResponse(200, suggestion).send(res);
});

const getPriceHistory = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findById(req.params.id).select('priceHistory');
  if (!mobile) throw ApiError.notFound('Listing not found');
  new ApiResponse(200, mobile.priceHistory).send(res);
});

const getHomeSections = asyncHandler(async (req, res) => {
  const baseFilter = { status: MOBILE_STATUS.ACTIVE };

  const sellerFields = 'name avatar ratingAvg ratingCount sellerProfile.isVerified';

  const [verified, premium, recentlyAdded, bestDeals, popularBrandsAgg] = await Promise.all([
    Mobile.find({ ...baseFilter, imeiVerified: true }).sort({ createdAt: -1 }).limit(10).populate('seller', sellerFields),
    Mobile.find({ ...baseFilter, isPremium: true }).sort({ createdAt: -1 }).limit(10).populate('seller', sellerFields),
    Mobile.find(baseFilter).sort({ createdAt: -1 }).limit(10).populate('seller', sellerFields),
    Mobile.find({
      ...baseFilter,
      mrp: { $exists: true, $ne: null },
      $expr: { $gte: [{ $subtract: ['$mrp', '$price'] }, 1000] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('seller', sellerFields),
    Mobile.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ]);

  new ApiResponse(200, {
    verified,
    premium,
    recentlyAdded,
    bestDeals,
    popularBrands: popularBrandsAgg.map((b) => ({ brand: b._id, count: b.count })),
  }).send(res);
});

// --- Admin ---

const listPendingApprovals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { status: MOBILE_STATUS.PENDING_APPROVAL };

  const [mobiles, total] = await Promise.all([
    Mobile.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate('seller', 'name email'),
    Mobile.countDocuments(filter),
  ]);

  new ApiResponse(200, mobiles, 'Pending approvals', buildMeta({ page, limit, total })).send(res);
});

const approveListing = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);
  if (!mobile) throw ApiError.notFound('Listing not found');

  mobile.status = MOBILE_STATUS.ACTIVE;
  mobile.approvedAt = new Date();
  mobile.approvedBy = req.user._id;
  mobile.rejectionReason = undefined;
  await mobile.save();

  await notificationService.notify({
    user: mobile.seller,
    type: NOTIFICATION_TYPE.LISTING_APPROVED,
    title: 'Listing approved',
    message: `Your listing ${mobile.brand} ${mobile.model} is now live`,
    data: { mobileId: mobile._id },
  });

  new ApiResponse(200, mobile, 'Listing approved').send(res);
});

const rejectListing = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findById(req.params.id);
  if (!mobile) throw ApiError.notFound('Listing not found');

  mobile.status = MOBILE_STATUS.REJECTED;
  mobile.rejectionReason = req.body.reason;
  await mobile.save();

  await notificationService.notify({
    user: mobile.seller,
    type: NOTIFICATION_TYPE.LISTING_REJECTED,
    title: 'Listing rejected',
    message: `Your listing ${mobile.brand} ${mobile.model} was rejected: ${req.body.reason}`,
    data: { mobileId: mobile._id },
  });

  new ApiResponse(200, mobile, 'Listing rejected').send(res);
});

const verifyImei = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findById(req.params.id).select('+imei');
  if (!mobile) throw ApiError.notFound('Listing not found');

  mobile.imeiVerified = req.body.verified;
  await mobile.save();

  new ApiResponse(200, { imeiVerified: mobile.imeiVerified }, 'IMEI verification updated').send(res);
});

module.exports = {
  createListing,
  uploadImages,
  uploadVideo,
  uploadPurchaseBill,
  updateListing,
  deleteListing,
  getListing,
  listListings,
  getMyListings,
  suggestPrice,
  getPriceHistory,
  getHomeSections,
  listPendingApprovals,
  approveListing,
  rejectListing,
  verifyImei,
};
