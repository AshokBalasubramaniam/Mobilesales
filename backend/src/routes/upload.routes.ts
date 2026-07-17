import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import cloudinaryUpload from '../middleware/cloudinaryUpload.middleware';

const router = Router();

router.post('/image', authenticateToken, cloudinaryUpload.single('image'), uploadImage);

export default router;
