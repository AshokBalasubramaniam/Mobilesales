import { Router } from 'express';
import {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller';
import validate from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import * as notificationValidation from '../validations/notification.validation';

const router = Router();

router.use(protect);

router.get('/', listMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', validate(notificationValidation.idParam), markAsRead);
router.delete('/:id', validate(notificationValidation.idParam), deleteNotification);

export default router;
