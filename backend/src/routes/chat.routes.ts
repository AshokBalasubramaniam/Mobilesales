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
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { chatMedia } from '../middleware/upload.middleware';
import * as chatValidation from '../validations/chat.validation';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/conversations/admin/all', authenticateToken, authorize(ROLES.ADMIN), listAllConversationsAdmin);

router.get('/conversations', authenticateToken, listMyConversations);
router.post('/conversations', authenticateToken, validate(chatValidation.startConversation), startConversation);
router.patch('/conversations/:id/block', authenticateToken, validate(chatValidation.idParam), blockConversation);
router.get('/conversations/:id', authenticateToken, validate(chatValidation.idParam), getConversationById);

router.get('/conversations/:id/messages', authenticateToken, validate(chatValidation.idParam), getMessages);
router.post('/conversations/:id/messages/text', authenticateToken, validate(chatValidation.sendTextMessage), sendTextMessage);
router.post('/conversations/:id/messages/media', authenticateToken, chatMedia.single('file'), validate(chatValidation.idParam), sendMediaMessage);
router.post('/conversations/:id/messages/offer', authenticateToken, validate(chatValidation.sendOffer), sendOffer);
router.patch('/conversations/:id/messages/:messageId/offer', authenticateToken, validate(chatValidation.respondOffer), respondToOffer);
router.post('/conversations/:id/messages/location', authenticateToken, validate(chatValidation.sendLocation), sendLocation);
router.post('/conversations/:id/call-events', authenticateToken, validate(chatValidation.logCallEvent), logCallEvent);

export default router;
