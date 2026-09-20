import { Router } from 'express';
import { getPublicSettings } from '../controllers/admin.controller';

const router = Router();

router.get('/public', getPublicSettings);

export default router;
