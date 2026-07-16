import { Router } from 'express';
import { sellerDashboard, buyerDashboard, adminDashboard } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(protect);

router.get('/seller', authorize(ROLES.SELLER), sellerDashboard);
router.get('/buyer', authorize(ROLES.BUYER), buyerDashboard);
router.get('/admin', authorize(ROLES.ADMIN), adminDashboard);

export default router;
