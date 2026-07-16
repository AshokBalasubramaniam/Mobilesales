import { Router } from 'express';
import {
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
} from '../controllers/mobile.controller';
import validate from '../middleware/validate.middleware';
import { protect, optionalAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { images, videos, documents } from '../middleware/upload.middleware';
import * as mobileValidation from '../validations/mobile.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/home-sections', getHomeSections);
router.post('/price-suggestion', protect, authorize(ROLES.SELLER), validate(mobileValidation.aiPriceSuggestion), suggestPrice);

router.get('/mine', protect, authorize(ROLES.SELLER), getMyListings);

router.get('/', validate(mobileValidation.listQuery), listListings);
router.post('/', protect, authorize(ROLES.SELLER), validate(mobileValidation.createListing), createListing);

// --- Admin moderation (declared before /:id to avoid param collision) ---
router.get('/admin/pending', protect, authorize(ROLES.ADMIN), listPendingApprovals);
router.patch('/admin/:id/approve', protect, authorize(ROLES.ADMIN), validate(mobileValidation.idParam), approveListing);
router.patch('/admin/:id/reject', protect, authorize(ROLES.ADMIN), validate(mobileValidation.rejectListing), rejectListing);
router.patch('/admin/:id/verify-imei', protect, authorize(ROLES.ADMIN), validate(mobileValidation.verifyImei), verifyImei);

router.get('/:id', optionalAuth, validate(mobileValidation.idParam), getListing);
router.get('/:id/price-history', validate(mobileValidation.idParam), getPriceHistory);
router.patch('/:id', protect, authorize(ROLES.SELLER), validate(mobileValidation.updateListing), updateListing);
router.delete('/:id', protect, authorize(ROLES.SELLER), validate(mobileValidation.idParam), deleteListing);

router.post('/:id/images', protect, authorize(ROLES.SELLER), images.array('images', 15), uploadImages);
router.post('/:id/video', protect, authorize(ROLES.SELLER), videos.single('video'), uploadVideo);
router.post('/:id/purchase-bill', protect, authorize(ROLES.SELLER), documents.single('bill'), validate(mobileValidation.idParam), uploadPurchaseBill);

export default router;
