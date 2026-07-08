const express = require('express');
const orderController = require('../controllers/order.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const orderValidation = require('../validations/order.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.BUYER), validate(orderValidation.createOrder), orderController.createOrder);
router.get('/my', authorize(ROLES.BUYER), orderController.listMyOrdersAsBuyer);
router.get('/selling', authorize(ROLES.SELLER), orderController.listMyOrdersAsSeller);
router.get('/admin/all', authorize(ROLES.ADMIN), orderController.listAllOrders);

router.get('/:id', validate(orderValidation.idParam), orderController.getOrder);
router.patch('/:id/tracking', authorize(ROLES.SELLER, ROLES.ADMIN), validate(orderValidation.updateTracking), orderController.updateTracking);
router.patch('/:id/cancel', validate(orderValidation.cancelOrder), orderController.cancelOrder);

module.exports = router;
