import { Router } from 'express';
import { buyerDashboard, adminDashboard } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { ROLES } from '../config/constants';

const router = Router();

// /account is open to every signed-in role, so sellers get their buyer-side
// stats (orders placed, wishlist, reviews) too.
router.get('/buyer', authenticateToken, authorize(ROLES.BUYER, ROLES.SELLER), buyerDashboard);
router.get('/admin', authenticateToken, authorize(ROLES.ADMIN), adminDashboard);

export default router;
