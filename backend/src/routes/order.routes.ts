import { Router } from 'express';
import {
  createOrder,
  getOrder,
  listMyOrdersAsBuyer,
  listMyOrdersAsSeller,
  updateTracking,
  cancelOrder,
  listAllOrders,
} from '../controllers/order.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import * as orderValidation from '../validations/order.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.post('/', authenticateToken, authorize(ROLES.BUYER), validate(orderValidation.createOrder), createOrder);
router.get('/my', authenticateToken, authorize(ROLES.BUYER), listMyOrdersAsBuyer);
router.get('/selling', authenticateToken, authorize(ROLES.SELLER), listMyOrdersAsSeller);
router.get('/admin/all', authenticateToken, authorize(ROLES.ADMIN), listAllOrders);

router.get('/:id', authenticateToken, validate(orderValidation.idParam), getOrder);
router.patch('/:id/tracking', authenticateToken, authorize(ROLES.SELLER, ROLES.ADMIN), validate(orderValidation.updateTracking), updateTracking);
router.patch('/:id/cancel', authenticateToken, validate(orderValidation.cancelOrder), cancelOrder);

export default router;
