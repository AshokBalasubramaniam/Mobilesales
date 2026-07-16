import { Router } from 'express';
import { revenueDashboard, salesAnalytics } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/revenue', revenueDashboard);
router.get('/analytics/sales', salesAnalytics);

export default router;
