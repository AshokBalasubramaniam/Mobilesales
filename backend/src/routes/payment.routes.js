const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const paymentValidation = require('../validations/payment.validation');

const router = express.Router();

router.use(protect);

router.post('/orders', validate(paymentValidation.createPaymentOrder), paymentController.createPaymentOrder);
router.post('/verify', validate(paymentValidation.verifyPayment), paymentController.verifyPayment);
router.get('/my', paymentController.getMyPayments);
router.post('/:id/refund', validate(paymentValidation.refund), paymentController.refundPayment);

module.exports = router;
