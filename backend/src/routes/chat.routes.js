const express = require('express');
const chatController = require('../controllers/chat.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const chatValidation = require('../validations/chat.validation');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/conversations/admin/all', authorize(ROLES.ADMIN), chatController.listAllConversationsAdmin);

router.get('/conversations', chatController.listMyConversations);
router.post('/conversations', validate(chatValidation.startConversation), chatController.startConversation);
router.patch('/conversations/:id/block', validate(chatValidation.idParam), chatController.blockConversation);
router.get('/conversations/:id', validate(chatValidation.idParam), chatController.getConversationById);

router.get('/conversations/:id/messages', validate(chatValidation.idParam), chatController.getMessages);
router.post('/conversations/:id/messages/text', validate(chatValidation.sendTextMessage), chatController.sendTextMessage);
router.post('/conversations/:id/messages/media', upload.chatMedia.single('file'), validate(chatValidation.idParam), chatController.sendMediaMessage);
router.post('/conversations/:id/messages/offer', validate(chatValidation.sendOffer), chatController.sendOffer);
router.patch('/conversations/:id/messages/:messageId/offer', validate(chatValidation.respondOffer), chatController.respondToOffer);
router.post('/conversations/:id/messages/location', validate(chatValidation.sendLocation), chatController.sendLocation);
router.post('/conversations/:id/call-events', validate(chatValidation.logCallEvent), chatController.logCallEvent);

module.exports = router;
