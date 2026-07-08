const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');
const storageService = require('../services/storage.service');
const notificationService = require('../services/notification.service');
const { emitToUser, isUserOnline } = require('../sockets');
const { MESSAGE_TYPE, OFFER_STATUS, NOTIFICATION_TYPE, ROLES } = require('../config/constants');

const otherParticipant = (conversation, userId) =>
  conversation.participants.find((p) => p.toString() !== userId.toString());

/**
 * Buyer/seller must be one of the two participants. Admins are not added to
 * `participants` (that would break the buyer/seller 1:1 unread-count and
 * "other participant" logic), but they can always read/reply for support and
 * dispute moderation.
 */
const assertAccess = (conversation, user) => {
  if (user.role === ROLES.ADMIN) return;
  const isParticipant = conversation.participants.some((p) => p.toString() === user._id.toString());
  if (!isParticipant) throw ApiError.forbidden('You are not part of this conversation');
};

const pushMessageToConversation = async (conversation, message, senderId) => {
  const recipients = conversation.participants.filter((p) => p.toString() !== senderId.toString());

  conversation.lastMessage = {
    text: message.type === MESSAGE_TYPE.TEXT ? message.content : `[${message.type}]`,
    type: message.type,
    sender: senderId,
    sentAt: message.createdAt,
  };
  recipients.forEach((recipient) => {
    const currentUnread = conversation.unreadCounts.get(recipient.toString()) || 0;
    conversation.unreadCounts.set(recipient.toString(), currentUnread + 1);
  });
  await conversation.save();

  await Promise.all(
    recipients.map(async (recipient) => {
      emitToUser(recipient, 'message:new', message);

      if (!isUserOnline(recipient.toString())) {
        await notificationService.notify({
          user: recipient,
          type: NOTIFICATION_TYPE.CHAT,
          title: 'New message',
          message:
            message.type === MESSAGE_TYPE.TEXT
              ? message.content.slice(0, 100)
              : `Sent you a${message.type === MESSAGE_TYPE.OFFER ? 'n offer' : ` ${message.type}`}`,
          data: { conversationId: conversation._id },
        });
      }
    })
  );
};

const startConversation = asyncHandler(async (req, res) => {
  const { recipientId, mobileId, message } = req.body;
  if (recipientId === req.user._id.toString()) throw ApiError.badRequest('Cannot start a conversation with yourself');

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
    ...(mobileId ? { mobile: mobileId } : { mobile: { $exists: false } }),
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants: [req.user._id, recipientId], mobile: mobileId });
  }

  if (message) {
    const created = await Message.create({ conversation: conversation._id, sender: req.user._id, type: MESSAGE_TYPE.TEXT, content: message });
    await created.populate('sender', 'name avatar role');
    await pushMessageToConversation(conversation, created, req.user._id);
  }

  new ApiResponse(201, conversation, 'Conversation started').send(res);
});

const listMyConversations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { participants: req.user._id };

  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name avatar')
      .populate('mobile', 'brand model images price status'),
    Conversation.countDocuments(filter),
  ]);

  const withMeta = conversations.map((c) => {
    const obj = c.toObject();
    obj.unreadCount = c.unreadCounts.get(req.user._id.toString()) || 0;
    obj.otherParticipant = obj.participants.find((p) => p._id.toString() !== req.user._id.toString());
    return obj;
  });

  new ApiResponse(200, withMeta, 'Conversations fetched', buildMeta({ page, limit, total })).send(res);
});

const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  await conversation.populate([
    { path: 'participants', select: 'name avatar email role sellerProfile.isVerified' },
    { path: 'mobile', select: 'brand model images price status' },
  ]);

  new ApiResponse(200, conversation).send(res);
});

// --- Admin: view/moderate any conversation for support and dispute resolution ---

const listAllConversationsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [conversations, total] = await Promise.all([
    Conversation.find({})
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name avatar email role')
      .populate('mobile', 'brand model images price status'),
    Conversation.countDocuments({}),
  ]);

  new ApiResponse(200, conversations, 'Conversations fetched', buildMeta({ page, limit, total })).send(res);
});

const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  const { page, limit, skip } = getPagination(req.query, { limit: 30 });

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversation._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar role'),
    Message.countDocuments({ conversation: conversation._id, isDeleted: false }),
  ]);

  new ApiResponse(200, messages.reverse(), 'Messages fetched', buildMeta({ page, limit, total })).send(res);
});

const sendTextMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);
  if (conversation.isBlocked && req.user.role !== ROLES.ADMIN) throw ApiError.forbidden('This conversation is blocked');

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    type: MESSAGE_TYPE.TEXT,
    content: req.body.content,
  });
  await message.populate('sender', 'name avatar role');

  await pushMessageToConversation(conversation, message, req.user._id);

  new ApiResponse(201, message).send(res);
});

const sendMediaMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const isVoice = req.file.mimetype.startsWith('audio/');
  const { url } = await storageService.uploadFile(req.file.buffer, {
    folder: isVoice ? 'chat/voice' : 'chat/images',
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    type: isVoice ? MESSAGE_TYPE.VOICE : MESSAGE_TYPE.IMAGE,
    mediaUrl: url,
  });
  await message.populate('sender', 'name avatar role');

  await pushMessageToConversation(conversation, message, req.user._id);

  new ApiResponse(201, message).send(res);
});

const sendOffer = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    type: MESSAGE_TYPE.OFFER,
    offer: { amount: req.body.amount, status: OFFER_STATUS.PENDING },
  });
  await message.populate('sender', 'name avatar role');

  await pushMessageToConversation(conversation, message, req.user._id);

  new ApiResponse(201, message).send(res);
});

const respondToOffer = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  const offerMessage = await Message.findOne({ _id: req.params.messageId, conversation: conversation._id, type: MESSAGE_TYPE.OFFER });
  if (!offerMessage) throw ApiError.notFound('Offer not found');
  if (offerMessage.sender.toString() === req.user._id.toString()) throw ApiError.badRequest('Cannot respond to your own offer');

  offerMessage.offer.status = req.body.status;
  await offerMessage.save();

  if (req.body.status === OFFER_STATUS.COUNTERED && req.body.counterAmount) {
    const counter = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      type: MESSAGE_TYPE.OFFER,
      offer: { amount: req.body.counterAmount, status: OFFER_STATUS.PENDING },
    });
    await counter.populate('sender', 'name avatar role');
    await pushMessageToConversation(conversation, counter, req.user._id);
  }

  emitToUser(offerMessage.sender, 'offer:response', { messageId: offerMessage._id, status: req.body.status });

  new ApiResponse(200, offerMessage, 'Offer response recorded').send(res);
});

const sendLocation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    type: MESSAGE_TYPE.LOCATION,
    location: req.body,
  });
  await message.populate('sender', 'name avatar role');

  await pushMessageToConversation(conversation, message, req.user._id);

  new ApiResponse(201, message).send(res);
});

const logCallEvent = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    type: MESSAGE_TYPE.VIDEO_CALL_EVENT,
    callEvent: { event: req.body.event, durationSeconds: req.body.durationSeconds },
  });

  conversation.lastMessage = { text: `Video call ${req.body.event}`, type: message.type, sender: req.user._id, sentAt: message.createdAt };
  await conversation.save();

  new ApiResponse(201, message).send(res);
});

const blockConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  assertAccess(conversation, req.user);

  conversation.isBlocked = true;
  conversation.blockedBy = req.user._id;
  await conversation.save();

  new ApiResponse(200, conversation, 'Conversation blocked').send(res);
});

module.exports = {
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
};
