import { Router } from 'express';
import { revenueDashboard, salesAnalytics } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/revenue', authenticateToken, authorize(ROLES.ADMIN), revenueDashboard);
router.get('/analytics/sales', authenticateToken, authorize(ROLES.ADMIN), salesAnalytics);

export default router;
