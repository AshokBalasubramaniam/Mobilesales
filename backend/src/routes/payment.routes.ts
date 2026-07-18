import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
  refundPayment,
} from '../controllers/payment.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as paymentValidation from '../validations/payment.validation';

const router = Router();

router.post('/orders', authenticateToken, validate(paymentValidation.createPaymentOrder), createPaymentOrder);
router.post('/verify', authenticateToken, validate(paymentValidation.verifyPayment), verifyPayment);
router.get('/my', authenticateToken, getMyPayments);
router.post('/:id/refund', authenticateToken, validate(paymentValidation.refund), refundPayment);

export default router;
