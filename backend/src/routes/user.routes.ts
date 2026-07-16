import { Router } from 'express';
import {
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
} from '../controllers/user.controller';
import validate from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { images, documents } from '../middleware/upload.middleware';
import * as userValidation from '../validations/user.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.patch('/me', protect, validate(userValidation.updateProfile), updateProfile);
router.post('/me/avatar', protect, images.single('avatar'), uploadAvatar);
router.post('/me/addresses', protect, validate(userValidation.addAddress), addAddress);
router.delete('/me/addresses/:addressId', protect, validate(userValidation.addressIdParam), removeAddress);
router.patch('/me/addresses/:addressId/default', protect, validate(userValidation.addressIdParam), setDefaultAddress);

router.post(
  '/seller/verification',
  protect,
  documents.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'purchaseBill', maxCount: 1 },
  ]),
  submitSellerVerification
);

router.get('/:id/public', validate(userValidation.idParam), getPublicProfile);

// --- Admin ---
router.get('/', protect, authorize(ROLES.ADMIN), listUsers);
router.get('/:id', protect, authorize(ROLES.ADMIN), validate(userValidation.idParam), getUserById);
router.patch('/:id/block', protect, authorize(ROLES.ADMIN), validate(userValidation.blockUser), blockUser);
router.patch('/:id/unblock', protect, authorize(ROLES.ADMIN), validate(userValidation.idParam), unblockUser);
router.patch(
  '/:id/seller-verification',
  protect,
  authorize(ROLES.ADMIN),
  validate(userValidation.reviewSellerVerification),
  reviewSellerVerification
);

export default router;
