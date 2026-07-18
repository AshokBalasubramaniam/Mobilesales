import { Router } from 'express';
import { revenueDashboard, salesAnalytics, getSettings, updateSettings } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import validate from '../middleware/validate.middleware';
import * as adminValidation from '../validations/admin.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/revenue', authenticateToken, authorize(ROLES.ADMIN), revenueDashboard);
router.get('/analytics/sales', authenticateToken, authorize(ROLES.ADMIN), salesAnalytics);
router.get('/settings', authenticateToken, authorize(ROLES.ADMIN), getSettings);
router.patch('/settings', authenticateToken, authorize(ROLES.ADMIN), validate(adminValidation.updateSettings), updateSettings);

export default router;
