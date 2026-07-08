const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/mobiles', require('./mobile.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/coupons', require('./coupon.routes'));
router.use('/reports', require('./report.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/admin', require('./admin.routes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() }));

module.exports = router;
