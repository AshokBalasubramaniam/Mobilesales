const express = require('express');
const couponController = require('../controllers/coupon.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const couponValidation = require('../validations/coupon.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/active', couponController.listActiveCoupons);
router.post('/apply', protect, validate(couponValidation.applyCoupon), couponController.applyCoupon);

router.get('/', protect, authorize(ROLES.ADMIN), couponController.listCoupons);
router.post('/', protect, authorize(ROLES.ADMIN), validate(couponValidation.createCoupon), couponController.createCoupon);
router.patch('/:id', protect, authorize(ROLES.ADMIN), validate(couponValidation.updateCoupon), couponController.updateCoupon);
router.delete('/:id', protect, authorize(ROLES.ADMIN), validate(couponValidation.idParam), couponController.deleteCoupon);

module.exports = router;
