import { Router } from 'express';
import {
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
  listActiveCoupons,
} from '../controllers/coupon.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import * as couponValidation from '../validations/coupon.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/active', listActiveCoupons);
router.post('/apply', authenticateToken, validate(couponValidation.applyCoupon), applyCoupon);

router.get('/', authenticateToken, authorize(ROLES.ADMIN), listCoupons);
router.post('/', authenticateToken, authorize(ROLES.ADMIN), validate(couponValidation.createCoupon), createCoupon);
router.patch('/:id', authenticateToken, authorize(ROLES.ADMIN), validate(couponValidation.updateCoupon), updateCoupon);
router.delete('/:id', authenticateToken, authorize(ROLES.ADMIN), validate(couponValidation.idParam), deleteCoupon);

export default router;
