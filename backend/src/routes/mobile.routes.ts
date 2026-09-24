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
  listAllListingsAdmin,
} from '../controllers/mobile.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { images, videos, documents } from '../middleware/upload.middleware';
import * as mobileValidation from '../validations/mobile.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/home-sections', optionalAuth, validate(mobileValidation.homeSectionsQuery), getHomeSections);
// Any signed-in user can list/manage devices — no separate seller role
// required. Ownership (seller: req.user._id) is still enforced inside each
// handler, so this only ever grants access to your own listings.
router.post('/price-suggestion', authenticateToken, validate(mobileValidation.aiPriceSuggestion), suggestPrice);

router.get('/mine', authenticateToken, getMyListings);

router.get('/', optionalAuth, validate(mobileValidation.listQuery), listListings);
router.post('/', authenticateToken, validate(mobileValidation.createListing), createListing);

// --- Admin moderation (declared before /:id to avoid param collision) ---
router.get('/admin', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.adminListQuery), listAllListingsAdmin);
router.get('/admin/pending', authenticateToken, authorize(ROLES.ADMIN), listPendingApprovals);
router.patch('/admin/:id/approve', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.idParam), approveListing);
router.patch('/admin/:id/reject', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.rejectListing), rejectListing);
router.patch('/admin/:id/verify-imei', authenticateToken, authorize(ROLES.ADMIN), validate(mobileValidation.verifyImei), verifyImei);

router.get('/:id', optionalAuth, validate(mobileValidation.idParam), getListing);
router.get('/:id/price-history', optionalAuth, validate(mobileValidation.idParam), getPriceHistory);
router.patch('/:id', authenticateToken, validate(mobileValidation.updateListing), updateListing);
router.delete('/:id', authenticateToken, validate(mobileValidation.idParam), deleteListing);

router.post('/:id/images', authenticateToken, images.array('images', 15), uploadImages);
router.post('/:id/video', authenticateToken, videos.single('video'), uploadVideo);
router.post('/:id/purchase-bill', authenticateToken, documents.single('bill'), validate(mobileValidation.idParam), uploadPurchaseBill);

export default router;
