import { Router } from 'express';
import { sellerDashboard, buyerDashboard, adminDashboard } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/seller', authenticateToken, authorize(ROLES.SELLER), sellerDashboard);
router.get('/buyer', authenticateToken, authorize(ROLES.BUYER), buyerDashboard);
router.get('/admin', authenticateToken, authorize(ROLES.ADMIN), adminDashboard);

export default router;
