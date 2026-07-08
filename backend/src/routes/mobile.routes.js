const express = require('express');
const mobileController = require('../controllers/mobile.controller');
const validate = require('../middleware/validate.middleware');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const mobileValidation = require('../validations/mobile.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/home-sections', mobileController.getHomeSections);
router.post('/price-suggestion', protect, authorize(ROLES.SELLER), validate(mobileValidation.aiPriceSuggestion), mobileController.suggestPrice);

router.get('/mine', protect, authorize(ROLES.SELLER), mobileController.getMyListings);

router.get('/', validate(mobileValidation.listQuery), mobileController.listListings);
router.post('/', protect, authorize(ROLES.SELLER), validate(mobileValidation.createListing), mobileController.createListing);

// --- Admin moderation (declared before /:id to avoid param collision) ---
router.get('/admin/pending', protect, authorize(ROLES.ADMIN), mobileController.listPendingApprovals);
router.patch('/admin/:id/approve', protect, authorize(ROLES.ADMIN), validate(mobileValidation.idParam), mobileController.approveListing);
router.patch('/admin/:id/reject', protect, authorize(ROLES.ADMIN), validate(mobileValidation.rejectListing), mobileController.rejectListing);
router.patch('/admin/:id/verify-imei', protect, authorize(ROLES.ADMIN), validate(mobileValidation.verifyImei), mobileController.verifyImei);

router.get('/:id', optionalAuth, validate(mobileValidation.idParam), mobileController.getListing);
router.get('/:id/price-history', validate(mobileValidation.idParam), mobileController.getPriceHistory);
router.patch('/:id', protect, authorize(ROLES.SELLER), validate(mobileValidation.updateListing), mobileController.updateListing);
router.delete('/:id', protect, authorize(ROLES.SELLER), validate(mobileValidation.idParam), mobileController.deleteListing);

router.post('/:id/images', protect, authorize(ROLES.SELLER), upload.images.array('images', 15), mobileController.uploadImages);
router.post('/:id/video', protect, authorize(ROLES.SELLER), upload.videos.single('video'), mobileController.uploadVideo);
router.post('/:id/purchase-bill', protect, authorize(ROLES.SELLER), upload.documents.single('bill'), validate(mobileValidation.idParam), mobileController.uploadPurchaseBill);

module.exports = router;
