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
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { images, videos, documents } from '../middleware/upload.middleware';
import * as mobileValidation from '../validations/mobile.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/home-sections', getHomeSections);
router.post('/price-suggestion', authenticateToken, authorize(ROLES.SELLER), validate(mobileValidation.aiPriceSuggestion), suggestPrice);

router.get('/mine', authenticateToken, authorize(ROLES.SELLER), getMyListings);

router.get('/', validate(mobileValidation.listQuery), listListings);
router.post('/', authenticateToken, authorize(ROLES.SELLER), validate(mobileValidation.createListing), createListing);

// --- Admin moderation (declared before /:id to avoid param collision) ---
router.get('/admin/pending', authenticateToken, authorize(ROLES.ADMIN), listPendingApprovals);
router.patch('/admin/:id/approve', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.idParam), approveListing);
router.patch('/admin/:id/reject', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.rejectListing), rejectListing);
router.patch('/admin/:id/verify-imei', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.verifyImei), verifyImei);

router.get('/:id', optionalAuth, validate(mobileValidation.idParam), getListing);
router.get('/:id/price-history', validate(mobileValidation.idParam), getPriceHistory);
router.patch('/:id', authenticateToken, authorize(ROLES.SELLER), validate(mobileValidation.updateListing), updateListing);
router.delete('/:id', authenticateToken, authorize(ROLES.SELLER), validate(mobileValidation.idParam), deleteListing);

router.post('/:id/images', authenticateToken, authorize(ROLES.SELLER), images.array('images', 15), uploadImages);
router.post('/:id/video', authenticateToken, authorize(ROLES.SELLER), videos.single('video'), uploadVideo);
router.post('/:id/purchase-bill', authenticateToken, authorize(ROLES.SELLER), documents.single('bill'), validate(mobileValidation.idParam), uploadPurchaseBill);

export default router;
