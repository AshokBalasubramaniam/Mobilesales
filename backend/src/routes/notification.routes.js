const express = require('express');
const notificationController = require('../controllers/notification.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const notificationValidation = require('../validations/notification.validation');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.listMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validate(notificationValidation.idParam), notificationController.markAsRead);
router.delete('/:id', validate(notificationValidation.idParam), notificationController.deleteNotification);

module.exports = router;
