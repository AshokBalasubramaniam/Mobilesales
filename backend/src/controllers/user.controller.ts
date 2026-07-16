import type { Request, Response } from 'express';
import type { FilterQuery, Types } from 'mongoose';
import User from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getPagination, buildMeta } from '../utils/pagination';
import { uploadFile } from '../services/storage.service';
import { notify } from '../services/notification.service';
import { VERIFICATION_STATUS, NOTIFICATION_TYPE, ROLES } from '../config/constants';
import type { Role, VerificationStatus } from '../types/constants';
import type { IAddress, IUser } from '../types/models';
import type { PaginationQuery } from '../types/common';

interface UpdateProfileBody {
  name?: string;
  phone?: string;
}

export const updateProfile = asyncHandler(async (req: Request<Record<string, never>, unknown, UpdateProfileBody>, res: Response) => {
  const { name, phone } = req.body;

  if (phone && phone !== req.user!.phone) {
    const existing = await User.findOne({ phone, _id: { $ne: req.user!._id } });
    if (existing) throw ApiError.conflict('This phone number is already in use');
    req.user!.isPhoneVerified = false;
  }

  if (name) req.user!.name = name;
  if (phone) req.user!.phone = phone;
  await req.user!.save();

  new ApiResponse(200, req.user!.toSafeJSON(), 'Profile updated').send(res);
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const { url } = await uploadFile(req.file.buffer, {
    folder: 'avatars',
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  req.user!.avatar = url;
  await req.user!.save();

  new ApiResponse(200, { avatar: url }, 'Avatar updated').send(res);
});

interface AddAddressBody {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export const addAddress = asyncHandler(async (req: Request<Record<string, never>, unknown, AddAddressBody>, res: Response) => {
  if (req.body.isDefault) {
    req.user!.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }
  req.user!.addresses.push(req.body);
  await req.user!.save();

  new ApiResponse(201, req.user!.addresses, 'Address added').send(res);
});

export const removeAddress = asyncHandler(async (req: Request<{ addressId: string }>, res: Response) => {
  req.user!.addresses = req.user!.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  ) as unknown as Types.DocumentArray<IAddress>;
  await req.user!.save();

  new ApiResponse(200, req.user!.addresses, 'Address removed').send(res);
});

export const setDefaultAddress = asyncHandler(async (req: Request<{ addressId: string }>, res: Response) => {
  let found = false;
  req.user!.addresses.forEach((addr) => {
    const isMatch = addr._id.toString() === req.params.addressId;
    addr.isDefault = isMatch;
    if (isMatch) found = true;
  });
  if (!found) throw ApiError.notFound('Address not found');
  await req.user!.save();

  new ApiResponse(200, req.user!.addresses, 'Default address updated').send(res);
});

type VerificationDocField = 'aadhaar' | 'pan' | 'selfie' | 'purchaseBill';
type VerificationDocKey = 'aadhaarUrl' | 'panUrl' | 'selfieUrl' | 'purchaseBillUrl';

export const submitSellerVerification = asyncHandler(async (req: Request, res: Response) => {
  const rawFiles = req.files;
  const files: Record<string, Express.Multer.File[] | undefined> = Array.isArray(rawFiles) || !rawFiles ? {} : rawFiles;

  if (!files.aadhaar || !files.pan || !files.selfie) {
    throw ApiError.badRequest('Aadhaar, PAN, and selfie documents are required');
  }

  const uploaded: Partial<Record<VerificationDocKey, string>> = {};
  const fieldMap: Array<[VerificationDocField, VerificationDocKey]> = [
    ['aadhaar', 'aadhaarUrl'],
    ['pan', 'panUrl'],
    ['selfie', 'selfieUrl'],
    ['purchaseBill', 'purchaseBillUrl'],
  ];

  for (const [field, key] of fieldMap) {
    const file = files[field]?.[0];
    if (file) {
      const { url } = await uploadFile(file.buffer, {
        folder: 'verification',
        originalName: file.originalname,
        mimetype: file.mimetype,
      });
      uploaded[key] = url;
    }
  }

  req.user!.role = ROLES.SELLER;
  req.user!.sellerProfile.documents = { ...req.user!.sellerProfile.documents, ...uploaded };
  req.user!.sellerProfile.verificationStatus = VERIFICATION_STATUS.PENDING;
  req.user!.sellerProfile.submittedAt = new Date();
  await req.user!.save();

  new ApiResponse(200, req.user!.sellerProfile, 'Verification documents submitted for review').send(res);
});

export const getPublicProfile = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const user = await User.findById(req.params.id).select(
    'name avatar ratingAvg ratingCount sellerProfile.isVerified createdAt role'
  );
  if (!user) throw ApiError.notFound('User not found');

  new ApiResponse(200, user).send(res);
});

// --- Admin ---

interface ListUsersQuery extends PaginationQuery {
  role?: Role;
  isBlocked?: string;
  verificationStatus?: VerificationStatus;
  q?: string;
}

interface UserAdminFilter {
  role?: Role;
  isBlocked?: boolean;
  'sellerProfile.verificationStatus'?: VerificationStatus;
  $or?: Array<{ name?: RegExp; email?: RegExp; phone?: RegExp }>;
}

export const listUsers = asyncHandler(async (req: Request<Record<string, never>, unknown, unknown, ListUsersQuery>, res: Response) => {
  const { role, isBlocked, verificationStatus, q } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter: UserAdminFilter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (verificationStatus) filter['sellerProfile.verificationStatus'] = verificationStatus;
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }];

  const [users, total] = await Promise.all([
    User.find(filter as FilterQuery<IUser>).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter as FilterQuery<IUser>),
  ]);

  new ApiResponse(200, users, 'Users fetched', buildMeta({ page, limit, total })).send(res);
});

export const getUserById = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  new ApiResponse(200, user).send(res);
});

interface BlockUserBody {
  reason: string;
}

export const blockUser = asyncHandler(async (req: Request<{ id: string }, unknown, BlockUserBody>, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = true;
  user.blockReason = req.body.reason;
  user.refreshTokens = [];
  await user.save();

  await notify({
    user: user._id,
    type: NOTIFICATION_TYPE.SYSTEM,
    title: 'Account blocked',
    message: `Your account has been blocked: ${req.body.reason}`,
  });

  new ApiResponse(200, user, 'User blocked').send(res);
});

export const unblockUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = false;
  user.blockReason = undefined;
  await user.save();

  new ApiResponse(200, user, 'User unblocked').send(res);
});

interface ReviewSellerVerificationBody {
  status: VerificationStatus;
  rejectionReason?: string;
}

export const reviewSellerVerification = asyncHandler(async (req: Request<{ id: string }, unknown, ReviewSellerVerificationBody>, res: Response) => {
  const { status, rejectionReason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.sellerProfile.verificationStatus = status;
  user.sellerProfile.isVerified = status === VERIFICATION_STATUS.APPROVED;
  user.sellerProfile.rejectionReason = status === VERIFICATION_STATUS.REJECTED ? rejectionReason : undefined;
  user.sellerProfile.reviewedAt = new Date();
  user.sellerProfile.reviewedBy = req.user!._id;
  await user.save();

  await notify({
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
