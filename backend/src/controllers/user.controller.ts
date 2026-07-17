import type { Request, Response } from "express";
import type { FilterQuery, Types } from "mongoose";
import User from "../models/User";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import { uploadFile } from "../services/storage.service";
import { notify } from "../services/notification.service";
import {
  VERIFICATION_STATUS,
  NOTIFICATION_TYPE,
  ROLES,
} from "../config/constants";
import type { Role, VerificationStatus } from "../types/constants";
import type { IAddress, IUser } from "../types/models";
import type { PaginationQuery } from "../types/common";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface UpdateProfileBody {
  name?: string;
  phone?: string;
}

export const updateProfile = async (
  req: Request<Record<string, never>, unknown, UpdateProfileBody>,
  res: Response,
) => {
  try {
    const { name, phone } = req.body;

    if (phone && phone !== req.user!.phone) {
      const existing = await User.findOne({
        phone,
        _id: { $ne: req.user!._id },
      });
      if (existing) {
        return res
          .status(409)
          .json({
            flag: "error",
            message: "This phone number is already in use",
          });
      }
      req.user!.isPhoneVerified = false;
    }

    if (name) req.user!.name = name;
    if (phone) req.user!.phone = phone;
    await req.user!.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: req.user!.toSafeJSON(),
        message: "Profile updated",
      });
  } catch (error) {
    sendError(res, "update profile", error);
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ flag: "error", message: "No file uploaded" });
    }

    const { url } = await uploadFile(req.file.buffer, {
      folder: "avatars",
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    req.user!.avatar = url;
    await req.user!.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: { avatar: url },
        message: "Avatar updated",
      });
  } catch (error) {
    sendError(res, "upload avatar", error);
  }
};

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

export const addAddress = async (
  req: Request<Record<string, never>, unknown, AddAddressBody>,
  res: Response,
) => {
  try {
    if (req.body.isDefault) {
      req.user!.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }
    req.user!.addresses.push(req.body);
    await req.user!.save();

    res
      .status(201)
      .json({
        flag: "success",
        data: req.user!.addresses,
        message: "Address added",
      });
  } catch (error) {
    sendError(res, "add address", error);
  }
};

export const removeAddress = async (
  req: Request<{ addressId: string }>,
  res: Response,
) => {
  try {
    req.user!.addresses = req.user!.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId,
    ) as unknown as Types.DocumentArray<IAddress>;
    await req.user!.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: req.user!.addresses,
        message: "Address removed",
      });
  } catch (error) {
    sendError(res, "remove address", error);
  }
};

export const setDefaultAddress = async (
  req: Request<{ addressId: string }>,
  res: Response,
) => {
  try {
    let found = false;
    req.user!.addresses.forEach((addr) => {
      const isMatch = addr._id.toString() === req.params.addressId;
      addr.isDefault = isMatch;
      if (isMatch) found = true;
    });
    if (!found) {
      return res
        .status(404)
        .json({ flag: "error", message: "Address not found" });
    }
    await req.user!.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: req.user!.addresses,
        message: "Default address updated",
      });
  } catch (error) {
    sendError(res, "set default address", error);
  }
};

type VerificationDocField = "aadhaar" | "pan" | "selfie" | "purchaseBill";
type VerificationDocKey =
  | "aadhaarUrl"
  | "panUrl"
  | "selfieUrl"
  | "purchaseBillUrl";

export const submitSellerVerification = async (req: Request, res: Response) => {
  try {
    const rawFiles = req.files;
    const files: Record<string, Express.Multer.File[] | undefined> =
      Array.isArray(rawFiles) || !rawFiles ? {} : rawFiles;

    if (!files.aadhaar || !files.pan || !files.selfie) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "Aadhaar, PAN, and selfie documents are required",
        });
    }

    const uploaded: Partial<Record<VerificationDocKey, string>> = {};
    const fieldMap: Array<[VerificationDocField, VerificationDocKey]> = [
      ["aadhaar", "aadhaarUrl"],
      ["pan", "panUrl"],
      ["selfie", "selfieUrl"],
      ["purchaseBill", "purchaseBillUrl"],
    ];

    for (const [field, key] of fieldMap) {
      const file = files[field]?.[0];
      if (file) {
        const { url } = await uploadFile(file.buffer, {
          folder: "verification",
          originalName: file.originalname,
          mimetype: file.mimetype,
        });
        uploaded[key] = url;
      }
    }

    req.user!.role = ROLES.SELLER;
    req.user!.sellerProfile.documents = {
      ...req.user!.sellerProfile.documents,
      ...uploaded,
    };
    req.user!.sellerProfile.verificationStatus = VERIFICATION_STATUS.PENDING;
    req.user!.sellerProfile.submittedAt = new Date();
    await req.user!.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: req.user!.sellerProfile,
        message: "Verification documents submitted for review",
      });
  } catch (error) {
    sendError(res, "submit seller verification", error);
  }
};

export const getPublicProfile = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name avatar ratingAvg ratingCount sellerProfile.isVerified createdAt role",
    );
    if (!user) {
      return res.status(404).json({ flag: "error", message: "User not found" });
    }

    res.status(200).json({ flag: "success", data: user });
  } catch (error) {
    sendError(res, "get public profile", error);
  }
};

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
  "sellerProfile.verificationStatus"?: VerificationStatus;
  $or?: Array<{ name?: RegExp; email?: RegExp; phone?: RegExp }>;
}

export const listUsers = async (
  req: Request<Record<string, never>, unknown, unknown, ListUsersQuery>,
  res: Response,
) => {
  try {
    const { role, isBlocked, verificationStatus, q } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter: UserAdminFilter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === "true";
    if (verificationStatus)
      filter["sellerProfile.verificationStatus"] = verificationStatus;
    if (q)
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") },
      ];

    const [users, total] = await Promise.all([
      User.find(filter as FilterQuery<IUser>)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter as FilterQuery<IUser>),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: users,
        message: "Users fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "list users", error);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ flag: "error", message: "User not found" });
    }
    res.status(200).json({ flag: "success", data: user });
  } catch (error) {
    sendError(res, "get user by id", error);
  }
};

interface BlockUserBody {
  reason: string;
}

export const blockUser = async (
  req: Request<{ id: string }, unknown, BlockUserBody>,
  res: Response,
) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ flag: "error", message: "User not found" });
    }

    user.isBlocked = true;
    user.blockReason = req.body.reason;
    user.refreshTokens = [];
    await user.save();

    await notify({
      user: user._id,
      type: NOTIFICATION_TYPE.SYSTEM,
      title: "Account blocked",
      message: `Your account has been blocked: ${req.body.reason}`,
    });

    res
      .status(200)
      .json({ flag: "success", data: user, message: "User blocked" });
  } catch (error) {
    sendError(res, "block user", error);
  }
};

export const unblockUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ flag: "error", message: "User not found" });
    }

    user.isBlocked = false;
    user.blockReason = undefined;
    await user.save();

    res
      .status(200)
      .json({ flag: "success", data: user, message: "User unblocked" });
  } catch (error) {
    sendError(res, "unblock user", error);
  }
};

interface ReviewSellerVerificationBody {
  status: VerificationStatus;
  rejectionReason?: string;
}

export const reviewSellerVerification = async (
  req: Request<{ id: string }, unknown, ReviewSellerVerificationBody>,
  res: Response,
) => {
  try {
    const { status, rejectionReason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ flag: "error", message: "User not found" });
    }

    user.sellerProfile.verificationStatus = status;
    user.sellerProfile.isVerified = status === VERIFICATION_STATUS.APPROVED;
    user.sellerProfile.rejectionReason =
      status === VERIFICATION_STATUS.REJECTED ? rejectionReason : undefined;
    user.sellerProfile.reviewedAt = new Date();
    user.sellerProfile.reviewedBy = req.user!._id;
    await user.save();

    await notify({
      user: user._id,
      type: NOTIFICATION_TYPE.VERIFICATION,
      title:
        status === VERIFICATION_STATUS.APPROVED
          ? "Seller verification approved"
          : "Seller verification rejected",
      message:
        status === VERIFICATION_STATUS.APPROVED
          ? "Congratulations! Your seller account is now verified."
          : `Your verification was rejected: ${rejectionReason || "documents did not meet requirements"}`,
    });

    res
      .status(200)
      .json({
        flag: "success",
        data: user.sellerProfile,
        message: "Verification status updated",
      });
  } catch (error) {
    sendError(res, "review seller verification", error);
  }
};
