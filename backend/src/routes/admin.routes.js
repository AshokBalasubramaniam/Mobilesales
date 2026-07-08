const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/revenue', adminController.revenueDashboard);
router.get('/analytics/sales', adminController.salesAnalytics);

module.exports = router;
