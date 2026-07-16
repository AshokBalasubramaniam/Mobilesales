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
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import * as orderValidation from '../validations/order.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.use(protect);

router.post('/', authorize(ROLES.BUYER), validate(orderValidation.createOrder), createOrder);
router.get('/my', authorize(ROLES.BUYER), listMyOrdersAsBuyer);
router.get('/selling', authorize(ROLES.SELLER), listMyOrdersAsSeller);
router.get('/admin/all', authorize(ROLES.ADMIN), listAllOrders);

router.get('/:id', validate(orderValidation.idParam), getOrder);
router.patch('/:id/tracking', authorize(ROLES.SELLER, ROLES.ADMIN), validate(orderValidation.updateTracking), updateTracking);
router.patch('/:id/cancel', validate(orderValidation.cancelOrder), cancelOrder);

export default router;
