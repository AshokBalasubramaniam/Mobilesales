const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const storageService = require('../services/storage.service');
const notificationService = require('../services/notification.service');
const { VERIFICATION_STATUS, NOTIFICATION_TYPE, ROLES } = require('../config/constants');

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  if (phone && phone !== req.user.phone) {
    const existing = await User.findOne({ phone, _id: { $ne: req.user._id } });
    if (existing) throw ApiError.conflict('This phone number is already in use');
    req.user.isPhoneVerified = false;
  }

  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  await req.user.save();

  new ApiResponse(200, req.user.toSafeJSON(), 'Profile updated').send(res);
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { url } = await storageService.uploadFile(req.file.buffer, {
    folder: 'avatars',
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  req.user.avatar = url;
  await req.user.save();

  new ApiResponse(200, { avatar: url }, 'Avatar updated').send(res);
});

const addAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    req.user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }
  req.user.addresses.push(req.body);
  await req.user.save();

  new ApiResponse(201, req.user.addresses, 'Address added').send(res);
});

const removeAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
  await req.user.save();

  new ApiResponse(200, req.user.addresses, 'Address removed').send(res);
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  let found = false;
  req.user.addresses.forEach((addr) => {
    const isMatch = addr._id.toString() === req.params.addressId;
    addr.isDefault = isMatch;
    if (isMatch) found = true;
  });
  if (!found) throw ApiError.notFound('Address not found');
  await req.user.save();

  new ApiResponse(200, req.user.addresses, 'Default address updated').send(res);
});

const submitSellerVerification = asyncHandler(async (req, res) => {
  const files = req.files || {};
  if (!files.aadhaar || !files.pan || !files.selfie) {
    throw ApiError.badRequest('Aadhaar, PAN, and selfie documents are required');
  }

  const uploaded = {};
  for (const [field, key] of [['aadhaar', 'aadhaarUrl'], ['pan', 'panUrl'], ['selfie', 'selfieUrl'], ['purchaseBill', 'purchaseBillUrl']]) {
    if (files[field]?.[0]) {
      const { url } = await storageService.uploadFile(files[field][0].buffer, {
        folder: 'verification',
        originalName: files[field][0].originalname,
        mimetype: files[field][0].mimetype,
      });
      uploaded[key] = url;
    }
  }

  req.user.role = ROLES.SELLER;
  req.user.sellerProfile.documents = { ...req.user.sellerProfile.documents, ...uploaded };
  req.user.sellerProfile.verificationStatus = VERIFICATION_STATUS.PENDING;
  req.user.sellerProfile.submittedAt = new Date();
  await req.user.save();

  new ApiResponse(200, req.user.sellerProfile, 'Verification documents submitted for review').send(res);
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name avatar ratingAvg ratingCount sellerProfile.isVerified createdAt role'
  );
  if (!user) throw ApiError.notFound('User not found');

  new ApiResponse(200, user).send(res);
});

// --- Admin ---

const listUsers = asyncHandler(async (req, res) => {
  const { role, isBlocked, verificationStatus, q } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (verificationStatus) filter['sellerProfile.verificationStatus'] = verificationStatus;
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  new ApiResponse(200, users, 'Users fetched', buildMeta({ page, limit, total })).send(res);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  new ApiResponse(200, user).send(res);
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = true;
  user.blockReason = req.body.reason;
  user.refreshTokens = [];
  await user.save();

  await notificationService.notify({
    user: user._id,
    type: NOTIFICATION_TYPE.SYSTEM,
    title: 'Account blocked',
    message: `Your account has been blocked: ${req.body.reason}`,
  });

  new ApiResponse(200, user, 'User blocked').send(res);
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = false;
  user.blockReason = undefined;
  await user.save();

  new ApiResponse(200, user, 'User unblocked').send(res);
});

const reviewSellerVerification = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.sellerProfile.verificationStatus = status;
  user.sellerProfile.isVerified = status === VERIFICATION_STATUS.APPROVED;
  user.sellerProfile.rejectionReason = status === VERIFICATION_STATUS.REJECTED ? rejectionReason : undefined;
  user.sellerProfile.reviewedAt = new Date();
  user.sellerProfile.reviewedBy = req.user._id;
  await user.save();

  await notificationService.notify({
    user: user._id,
    type: NOTIFICATION_TYPE.VERIFICATION,
    title: status === VERIFICATION_STATUS.APPROVED ? 'Seller verification approved' : 'Seller verification rejected',
    message:
      status === VERIFICATION_STATUS.APPROVED
        ? 'Congratulations! Your seller account is now verified.'
        : `Your verification was rejected: ${rejectionReason || 'documents did not meet requirements'}`,
  });

  new ApiResponse(200, user.sellerProfile, 'Verification status updated').send(res);
});

module.exports = {
  updateProfile,
  uploadAvatar,
  addAddress,
  removeAddress,
  setDefaultAddress,
  submitSellerVerification,
  getPublicProfile,
  listUsers,
  getUserById,
  blockUser,
  unblockUser,
  reviewSellerVerification,
};
