import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
  refundPayment,
} from '../controllers/payment.controller';
import validate from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import * as paymentValidation from '../validations/payment.validation';

const router = Router();

router.use(protect);

router.post('/orders', validate(paymentValidation.createPaymentOrder), createPaymentOrder);
router.post('/verify', validate(paymentValidation.verifyPayment), verifyPayment);
router.get('/my', getMyPayments);
router.post('/:id/refund', validate(paymentValidation.refund), refundPayment);

export default router;
