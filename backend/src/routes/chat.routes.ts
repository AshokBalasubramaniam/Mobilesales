import { Router } from 'express';
import {
  startConversation,
  listMyConversations,
  listAllConversationsAdmin,
  getConversationById,
  getMessages,
  sendTextMessage,
  sendMediaMessage,
  sendOffer,
  respondToOffer,
  sendLocation,
  logCallEvent,
  blockConversation,
} from '../controllers/chat.controller';
import validate from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { chatMedia } from '../middleware/upload.middleware';
import * as chatValidation from '../validations/chat.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.use(protect);

router.get('/conversations/admin/all', authorize(ROLES.ADMIN), listAllConversationsAdmin);

router.get('/conversations', listMyConversations);
router.post('/conversations', validate(chatValidation.startConversation), startConversation);
router.patch('/conversations/:id/block', validate(chatValidation.idParam), blockConversation);
router.get('/conversations/:id', validate(chatValidation.idParam), getConversationById);

router.get('/conversations/:id/messages', validate(chatValidation.idParam), getMessages);
router.post('/conversations/:id/messages/text', validate(chatValidation.sendTextMessage), sendTextMessage);
router.post('/conversations/:id/messages/media', chatMedia.single('file'), validate(chatValidation.idParam), sendMediaMessage);
router.post('/conversations/:id/messages/offer', validate(chatValidation.sendOffer), sendOffer);
router.patch('/conversations/:id/messages/:messageId/offer', validate(chatValidation.respondOffer), respondToOffer);
router.post('/conversations/:id/messages/location', validate(chatValidation.sendLocation), sendLocation);
router.post('/conversations/:id/call-events', validate(chatValidation.logCallEvent), logCallEvent);

export default router;
