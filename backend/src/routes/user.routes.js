const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const userValidation = require('../validations/user.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.patch('/me', protect, validate(userValidation.updateProfile), userController.updateProfile);
router.post('/me/avatar', protect, upload.images.single('avatar'), userController.uploadAvatar);
router.post('/me/addresses', protect, validate(userValidation.addAddress), userController.addAddress);
router.delete('/me/addresses/:addressId', protect, validate(userValidation.addressIdParam), userController.removeAddress);
router.patch('/me/addresses/:addressId/default', protect, validate(userValidation.addressIdParam), userController.setDefaultAddress);

router.post(
  '/seller/verification',
  protect,
  upload.documents.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'purchaseBill', maxCount: 1 },
  ]),
  userController.submitSellerVerification
);

router.get('/:id/public', validate(userValidation.idParam), userController.getPublicProfile);

// --- Admin ---
router.get('/', protect, authorize(ROLES.ADMIN), userController.listUsers);
router.get('/:id', protect, authorize(ROLES.ADMIN), validate(userValidation.idParam), userController.getUserById);
router.patch('/:id/block', protect, authorize(ROLES.ADMIN), validate(userValidation.blockUser), userController.blockUser);
router.patch('/:id/unblock', protect, authorize(ROLES.ADMIN), validate(userValidation.idParam), userController.unblockUser);
router.patch(
  '/:id/seller-verification',
  protect,
  authorize(ROLES.ADMIN),
  validate(userValidation.reviewSellerVerification),
  userController.reviewSellerVerification
);

module.exports = router;
