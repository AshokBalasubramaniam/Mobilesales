import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import mobileRoutes from './mobile.routes';
import wishlistRoutes from './wishlist.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import couponRoutes from './coupon.routes';
import reportRoutes from './report.routes';
import chatRoutes from './chat.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/mobiles', mobileRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/reports', reportRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

router.get('/health', (_req, res) => res.json({ flag: 'success', message: 'API is healthy', timestamp: new Date().toISOString() }));

export default router;
