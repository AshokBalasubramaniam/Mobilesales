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
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import * as reportValidation from '../validations/report.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.use(protect);

router.post('/', validate(reportValidation.createReport), createReport);
router.get('/', authorize(ROLES.ADMIN), listReports);
router.patch('/:id/resolve', authorize(ROLES.ADMIN), validate(reportValidation.resolveReport), resolveReport);

router.post('/disputes', validate(reportValidation.createDispute), createDispute);
router.get('/disputes', authorize(ROLES.ADMIN), listDisputes);
router.patch('/disputes/:id/resolve', authorize(ROLES.ADMIN), validate(reportValidation.resolveDispute), resolveDispute);

export default router;
