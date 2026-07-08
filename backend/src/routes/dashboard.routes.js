const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/seller', authorize(ROLES.SELLER), dashboardController.sellerDashboard);
router.get('/buyer', authorize(ROLES.BUYER), dashboardController.buyerDashboard);
router.get('/admin', authorize(ROLES.ADMIN), dashboardController.adminDashboard);

module.exports = router;
