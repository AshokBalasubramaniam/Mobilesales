import { Router } from 'express';
import { getPublicSettings } from '../controllers/admin.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/public', optionalAuth, getPublicSettings);

export default router;
