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
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { images, documents } from '../middleware/upload.middleware';
import * as userValidation from '../validations/user.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.patch('/me', authenticateToken, validate(userValidation.updateProfile), updateProfile);
router.post('/me/avatar', authenticateToken, images.single('avatar'), uploadAvatar);
router.post('/me/addresses', authenticateToken, validate(userValidation.addAddress), addAddress);
router.delete('/me/addresses/:addressId', authenticateToken, validate(userValidation.addressIdParam), removeAddress);
router.patch('/me/addresses/:addressId/default', authenticateToken, validate(userValidation.addressIdParam), setDefaultAddress);

router.post(
  '/seller/verification',
  authenticateToken,
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
router.get('/', authenticateToken, authorize(ROLES.ADMIN), listUsers);
router.get('/:id', authenticateToken, authorize(ROLES.ADMIN), validate(userValidation.idParam), getUserById);
router.patch('/:id/block', authenticateToken, authorize(ROLES.ADMIN), validate(userValidation.blockUser), blockUser);
router.patch('/:id/unblock', authenticateToken, authorize(ROLES.ADMIN), validate(userValidation.idParam), unblockUser);
router.patch(
  '/:id/seller-verification',
  authenticateToken,
  authorize(ROLES.ADMIN),
  validate(userValidation.reviewSellerVerification),
  reviewSellerVerification
);

export default router;
