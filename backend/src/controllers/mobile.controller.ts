import type { Request, Response } from "express";
import type { FilterQuery, Types } from "mongoose";
import Mobile from "../models/Mobile";
import User from "../models/User";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import * as storageService from "../services/storage.service";
import * as priceSuggestionService from "../services/priceSuggestion.service";
import * as notificationService from "../services/notification.service";
import { MOBILE_STATUS, ROLES, NOTIFICATION_TYPE } from "../config/constants";
import type {
  IMobile,
  IMobileLocation,
  IRepairHistoryItem,
} from "../types/models";
import type { Populated } from "../types/common";
import type { MobileCondition, MobileStatus } from "../types/constants";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

const toArray = <T>(val: T | T[] | undefined): T[] | undefined =>
  val === undefined ? undefined : Array.isArray(val) ? val : [val];

interface CreateListingLocationBody {
  state: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

interface CreateListingBody {
  brand: string;
  model: string;
  color?: string;
  storage: number;
  ram: number;
  condition: MobileCondition;
  batteryHealth: number;
  price: number;
  mrp?: number;
  negotiable?: boolean;
  imei?: string;
  warranty?: { hasWarranty?: boolean; expiryDate?: Date | null };
  repairHistory?: IRepairHistoryItem[];
  originalBoxAvailable?: boolean;
  chargerIncluded?: boolean;
  accessoriesIncluded?: string[];
  description?: string;
  location: CreateListingLocationBody;
}

type MobileCreatePayload = Omit<CreateListingBody, "location"> & {
  seller: Types.ObjectId;
  status: MobileStatus;
  location: CreateListingLocationBody | IMobileLocation;
};

export const createListing = async (
  req: Request<Record<string, never>, unknown, CreateListingBody>,
  res: Response,
) => {
  try {
    const payload: MobileCreatePayload = {
      ...req.body,
      seller: req.user!._id,
      status: MOBILE_STATUS.PENDING_APPROVAL,
    };

    if (payload.location) {
      const rawLocation = payload.location as CreateListingLocationBody;
      payload.location = {
        state: rawLocation.state,
        city: rawLocation.city,
        pincode: rawLocation.pincode,
        geo: {
          type: "Point",
          coordinates: [rawLocation.lng || 0, rawLocation.lat || 0],
        },
      };
    }

    const mobile = await Mobile.create(payload);
    res
      .status(201)
      .json({
        flag: "success",
        data: mobile,
        message: "Listing created and submitted for approval",
      });
  } catch (error) {
    sendError(res, "create listing", error);
  }
};

export const uploadImages = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findOne({
      _id: req.params.id,
      seller: req.user!._id,
    });
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    const files = Array.isArray(req.files) ? req.files : undefined;
    if (!files?.length)
      return res
        .status(400)
        .json({ flag: "error", message: "No images uploaded" });

    const uploaded = await Promise.all(
      files.map((file, idx) =>
        storageService
          .uploadFile(file.buffer, {
            folder: "listings/images",
            originalName: file.originalname,
            mimetype: file.mimetype,
          })
          .then(({ url, key }) => ({
            url,
            key,
            isPrimary: mobile.images.length === 0 && idx === 0,
            order: mobile.images.length + idx,
          })),
      ),
    );

    mobile.images.push(...uploaded);
    await mobile.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: mobile.images,
        message: "Images uploaded",
      });
  } catch (error) {
    sendError(res, "upload images", error);
  }
};

export const uploadVideo = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findOne({
      _id: req.params.id,
      seller: req.user!._id,
    });
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    if (!req.file)
      return res
        .status(400)
        .json({ flag: "error", message: "No video uploaded" });

    const { url, key } = await storageService.uploadFile(req.file.buffer, {
      folder: "listings/videos",
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    mobile.videos.push({ url, key });
    await mobile.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: mobile.videos,
        message: "Video uploaded",
      });
  } catch (error) {
    sendError(res, "upload video", error);
  }
};

export const uploadPurchaseBill = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findOne({
      _id: req.params.id,
      seller: req.user!._id,
    });
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    if (!req.file)
      return res
        .status(400)
        .json({ flag: "error", message: "No file uploaded" });

    const { url } = await storageService.uploadFile(req.file.buffer, {
      folder: "listings/bills",
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    mobile.purchaseBillUrl = url;
    await mobile.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: { purchaseBillUrl: url },
        message: "Purchase bill uploaded",
      });
  } catch (error) {
    sendError(res, "upload purchase bill", error);
  }
};

type UpdateListingBody = Partial<CreateListingBody>;

export const updateListing = async (
  req: Request<{ id: string }, unknown, UpdateListingBody>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findOne({
      _id: req.params.id,
      seller: req.user!._id,
    });
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    if (mobile.status === MOBILE_STATUS.SOLD)
      return res
        .status(400)
        .json({ flag: "error", message: "Cannot edit a sold listing" });

    Object.assign(mobile, req.body);
    if (req.body.location) {
      mobile.location.state = req.body.location.state ?? mobile.location.state;
      mobile.location.city = req.body.location.city ?? mobile.location.city;
      mobile.location.pincode =
        req.body.location.pincode ?? mobile.location.pincode;
      if (
        req.body.location.lat !== undefined ||
        req.body.location.lng !== undefined
      ) {
        mobile.location.geo = {
          type: "Point",
          coordinates: [
            req.body.location.lng ?? mobile.location.geo.coordinates[0],
            req.body.location.lat ?? mobile.location.geo.coordinates[1],
          ],
        };
      }
    }
    mobile.status = MOBILE_STATUS.PENDING_APPROVAL; // edits require re-approval
    await mobile.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: mobile,
        message: "Listing updated and resubmitted for approval",
      });
  } catch (error) {
    sendError(res, "update listing", error);
  }
};

export const deleteListing = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findOne({
      _id: req.params.id,
      seller: req.user!._id,
    });
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });

    mobile.status = MOBILE_STATUS.REMOVED;
    await mobile.save();

    res
      .status(200)
      .json({ flag: "success", data: null, message: "Listing removed" });
  } catch (error) {
    sendError(res, "delete listing", error);
  }
};

interface PopulatedListingSeller {
  _id: Types.ObjectId;
  name: string;
  avatar: string;
  ratingAvg: number;
  ratingCount: number;
  sellerProfile: { isVerified: boolean };
  createdAt: Date;
}

type MobileWithSeller = Populated<IMobile, { seller: PopulatedListingSeller }>;

export const getListing = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = (await Mobile.findById(req.params.id).populate(
      "seller",
      "name avatar ratingAvg ratingCount sellerProfile.isVerified createdAt",
    )) as MobileWithSeller | null;
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });

    const isOwner = Boolean(
      req.user && mobile.seller._id.toString() === req.user._id.toString(),
    );
    if (
      mobile.status !== MOBILE_STATUS.ACTIVE &&
      !isOwner &&
      req.user?.role !== ROLES.ADMIN
    ) {
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    }

    if (!isOwner) {
      Mobile.updateOne({ _id: mobile._id }, { $inc: { views: 1 } }).exec();
    }

    res.status(200).json({ flag: "success", data: mobile });
  } catch (error) {
    sendError(res, "get listing", error);
  }
};

interface MobileListQuery {
  page?: string;
  limit?: string;
  brand?: string | string[];
  model?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  ram?: string | string[];
  storage?: string | string[];
  minBatteryHealth?: string;
  condition?: MobileCondition;
  hasWarranty?: string | boolean;
  verifiedSeller?: string | boolean;
  verifiedImei?: string | boolean;
  seller?: string;
  state?: string;
  city?: string;
  pincode?: string;
  lat?: string;
  lng?: string;
  radiusKm?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
}

const buildSearchFilter = (query: MobileListQuery): FilterQuery<IMobile> => {
  const filter: FilterQuery<IMobile> = { status: MOBILE_STATUS.ACTIVE };

  const brand = toArray(query.brand);
  if (brand)
    filter.brand = { $in: brand.map((b) => new RegExp(`^${b}$`, "i")) };
  if (query.model) filter.model = new RegExp(query.model, "i");
  if (query.q) filter.$text = { $search: query.q };

  if (query.minPrice || query.maxPrice) {
    const price: { $gte?: number; $lte?: number } = {};
    if (query.minPrice) price.$gte = Number(query.minPrice);
    if (query.maxPrice) price.$lte = Number(query.maxPrice);
    filter.price = price;
  }

  const ram = toArray(query.ram);
  if (ram) filter.ram = { $in: ram.map(Number) };
  const storage = toArray(query.storage);
  if (storage) filter.storage = { $in: storage.map(Number) };

  if (query.minBatteryHealth)
    filter.batteryHealth = { $gte: Number(query.minBatteryHealth) };
  if (query.condition) filter.condition = query.condition;
  if (query.hasWarranty !== undefined)
    filter["warranty.hasWarranty"] =
      query.hasWarranty === "true" || query.hasWarranty === true;
  if (query.verifiedImei !== undefined)
    filter.imeiVerified =
      query.verifiedImei === "true" || query.verifiedImei === true;

  if (query.state)
    filter["location.state"] = new RegExp(`^${query.state}$`, "i");
  if (query.city) filter["location.city"] = new RegExp(`^${query.city}$`, "i");
  if (query.pincode) filter["location.pincode"] = query.pincode;

  return filter;
};

const SORT_MAP: Record<
  "newest" | "price_asc" | "price_desc" | "popular",
  Record<string, 1 | -1>
> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { views: -1, likesCount: -1 },
};

export const listListings = async (
  req: Request<Record<string, never>, unknown, unknown, MobileListQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildSearchFilter(req.query);

    if (req.query.verifiedSeller !== undefined) {
      const verified =
        req.query.verifiedSeller === "true" ||
        req.query.verifiedSeller === true;
      const sellerIds = await User.find({
        "sellerProfile.isVerified": verified,
      }).distinct("_id");
      filter.seller = { $in: sellerIds };
    }
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }

    let query;
    if (req.query.lat && req.query.lng) {
      const radiusMeters = (Number(req.query.radiusKm) || 25) * 1000;
      filter["location.geo"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(req.query.lng), Number(req.query.lat)],
          },
          $maxDistance: radiusMeters,
        },
      };
      query = Mobile.find(filter);
    } else {
      query = Mobile.find(filter).sort(SORT_MAP[req.query.sort || "newest"]);
    }

    const [mobiles, total] = await Promise.all([
      query
        .skip(skip)
        .limit(limit)
        .populate("seller", "name avatar sellerProfile.isVerified ratingAvg"),
      Mobile.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: mobiles,
        message: "Listings fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "list listings", error);
  }
};

interface MyListingsQuery {
  page?: string;
  limit?: string;
  status?: MobileStatus;
}

export const getMyListings = async (
  req: Request<Record<string, never>, unknown, unknown, MyListingsQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<IMobile> = { seller: req.user!._id };
    if (req.query.status) filter.status = req.query.status;

    const [mobiles, total] = await Promise.all([
      Mobile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Mobile.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: mobiles,
        message: "Your listings",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "get your listings", error);
  }
};

interface SuggestPriceBody {
  brand: string;
  model: string;
  storage: number;
  ram: number;
  condition: MobileCondition;
  batteryHealth: number;
  mrp?: number;
}

export const suggestPrice = async (
  req: Request<Record<string, never>, unknown, SuggestPriceBody>,
  res: Response,
) => {
  try {
    const suggestion = await priceSuggestionService.suggestPrice(req.body);
    res.status(200).json({ flag: "success", data: suggestion });
  } catch (error) {
    sendError(res, "suggest price", error);
  }
};

export const getPriceHistory = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findById(req.params.id).select("priceHistory");
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    res.status(200).json({ flag: "success", data: mobile.priceHistory });
  } catch (error) {
    sendError(res, "get price history", error);
  }
};

export const getHomeSections = async (_req: Request, res: Response) => {
  try {
    const baseFilter: FilterQuery<IMobile> = { status: MOBILE_STATUS.ACTIVE };

    const sellerFields =
      "name avatar ratingAvg ratingCount sellerProfile.isVerified";

    interface PopularBrandAggResult {
      _id: string;
      count: number;
    }

    const [verified, premium, recentlyAdded, bestDeals, popularBrandsAgg] =
      await Promise.all([
        Mobile.find({ ...baseFilter, imeiVerified: true })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("seller", sellerFields),
        Mobile.find({ ...baseFilter, isPremium: true })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("seller", sellerFields),
        Mobile.find(baseFilter)
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("seller", sellerFields),
        Mobile.find({
          ...baseFilter,
          mrp: { $exists: true, $ne: null },
          $expr: { $gte: [{ $subtract: ["$mrp", "$price"] }, 1000] },
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("seller", sellerFields),
        Mobile.aggregate<PopularBrandAggResult>([
          { $match: baseFilter },
          { $group: { _id: "$brand", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
      ]);

    res.status(200).json({
      flag: "success",
      data: {
        verified,
        premium,
        recentlyAdded,
        bestDeals,
        popularBrands: popularBrandsAgg.map((b) => ({
          brand: b._id,
          count: b.count,
        })),
      },
    });
  } catch (error) {
    sendError(res, "get home sections", error);
  }
};

// --- Admin ---

interface PendingApprovalsQuery {
  page?: string;
  limit?: string;
}

export const listPendingApprovals = async (
  req: Request<Record<string, never>, unknown, unknown, PendingApprovalsQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<IMobile> = {
      status: MOBILE_STATUS.PENDING_APPROVAL,
    };

    const [mobiles, total] = await Promise.all([
      Mobile.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("seller", "name email"),
      Mobile.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: mobiles,
        message: "Pending approvals",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "list pending approvals", error);
  }
};

export const approveListing = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findById(req.params.id);
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });

    mobile.status = MOBILE_STATUS.ACTIVE;
    mobile.approvedAt = new Date();
    mobile.approvedBy = req.user!._id;
    mobile.rejectionReason = undefined;
    await mobile.save();

    await notificationService.notify({
      user: mobile.seller,
      type: NOTIFICATION_TYPE.LISTING_APPROVED,
      title: "Listing approved",
      message: `Your listing ${mobile.brand} ${mobile.model} is now live`,
      data: { mobileId: mobile._id },
    });

    res
      .status(200)
      .json({ flag: "success", data: mobile, message: "Listing approved" });
  } catch (error) {
    sendError(res, "approve listing", error);
  }
};

interface RejectListingBody {
  reason: string;
}

export const rejectListing = async (
  req: Request<{ id: string }, unknown, RejectListingBody>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findById(req.params.id);
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });

    mobile.status = MOBILE_STATUS.REJECTED;
    mobile.rejectionReason = req.body.reason;
    await mobile.save();

    await notificationService.notify({
      user: mobile.seller,
      type: NOTIFICATION_TYPE.LISTING_REJECTED,
      title: "Listing rejected",
      message: `Your listing ${mobile.brand} ${mobile.model} was rejected: ${req.body.reason}`,
      data: { mobileId: mobile._id },
    });

    res
      .status(200)
      .json({ flag: "success", data: mobile, message: "Listing rejected" });
  } catch (error) {
    sendError(res, "reject listing", error);
  }
};

interface VerifyImeiBody {
  verified: boolean;
}

export const verifyImei = async (
  req: Request<{ id: string }, unknown, VerifyImeiBody>,
  res: Response,
) => {
  try {
    const mobile = await Mobile.findById(req.params.id).select("+imei");
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });

    mobile.imeiVerified = req.body.verified;
    await mobile.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: { imeiVerified: mobile.imeiVerified },
        message: "IMEI verification updated",
      });
  } catch (error) {
    sendError(res, "verify IMEI", error);
  }
};
