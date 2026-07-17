import { Router } from 'express';
import {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as notificationValidation from '../validations/notification.validation';

const router = Router();

router.get('/', authenticateToken, listMyNotifications);
router.patch('/read-all', authenticateToken, markAllAsRead);
router.patch('/:id/read', authenticateToken, validate(notificationValidation.idParam), markAsRead);
router.delete('/:id', authenticateToken, validate(notificationValidation.idParam), deleteNotification);

export default router;
