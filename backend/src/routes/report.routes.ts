import { Router } from 'express';
import {
  createReport,
  listReports,
  resolveReport,
  createDispute,
  listDisputes,
  resolveDispute,
} from '../controllers/report.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import * as reportValidation from '../validations/report.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.post('/', authenticateToken, validate(reportValidation.createReport), createReport);
router.get('/', authenticateToken, authorize(ROLES.ADMIN), listReports);
router.patch('/:id/resolve', authenticateToken, authorize(ROLES.ADMIN), validate(reportValidation.resolveReport), resolveReport);

router.post('/disputes', authenticateToken, validate(reportValidation.createDispute), createDispute);
router.get('/disputes', authenticateToken, authorize(ROLES.ADMIN), listDisputes);
router.patch('/disputes/:id/resolve', authenticateToken, authorize(ROLES.ADMIN), validate(reportValidation.resolveDispute), resolveDispute);

export default router;
