const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const logger = require('../utils/logger');
const { ROLES } = require('../config/constants');

const conversationRoom = (conversationId) => `conversation:${conversationId}`;

const assertParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
  return conversation;
};

/**
 * Registers per-socket chat event handlers. Messages themselves are created
 * via REST (so uploads/validation go through one path); sockets handle the
 * realtime layer: room membership, typing, read receipts, and WebRTC call
 * signaling relay for video calls.
 */
const registerChatHandlers = (io, socket) => {
  const { userId } = socket;

  socket.on('conversation:join', async (conversationId, ack) => {
    // Admins aren't listed participants but can join any conversation for support/moderation.
    const conversation =
      socket.role === ROLES.ADMIN ? await Conversation.findById(conversationId) : await assertParticipant(conversationId, userId);
    if (!conversation) return ack?.({ ok: false, error: 'Not a participant of this conversation' });
    socket.join(conversationRoom(conversationId));
    ack?.({ ok: true });
  });

  socket.on('conversation:leave', (conversationId) => {
    socket.leave(conversationRoom(conversationId));
  });

  socket.on('typing:start', ({ conversationId }) => {
    socket.to(conversationRoom(conversationId)).emit('typing:start', { conversationId, userId });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(conversationRoom(conversationId)).emit('typing:stop', { conversationId, userId });
  });

  socket.on('message:read', async ({ conversationId }, ack) => {
    const conversation = await assertParticipant(conversationId, userId);
    if (!conversation) return ack?.({ ok: false, error: 'Not a participant of this conversation' });

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();

    io.to(conversationRoom(conversationId)).emit('message:read', { conversationId, readBy: userId, readAt: new Date() });
    ack?.({ ok: true });
  });

  // --- WebRTC signaling relay for video calls (media negotiated peer-to-peer on the client) ---
  socket.on('call:invite', ({ conversationId, toUserId, sdp }) => {
    io.to(`user:${toUserId}`).emit('call:invite', { conversationId, fromUserId: userId, sdp });
  });

  socket.on('call:answer', ({ toUserId, sdp }) => {
    io.to(`user:${toUserId}`).emit('call:answer', { fromUserId: userId, sdp });
  });

  socket.on('call:ice-candidate', ({ toUserId, candidate }) => {
    io.to(`user:${toUserId}`).emit('call:ice-candidate', { fromUserId: userId, candidate });
  });

  socket.on('call:end', ({ toUserId, conversationId }) => {
    io.to(`user:${toUserId}`).emit('call:end', { fromUserId: userId, conversationId });
  });

  socket.on('call:decline', ({ toUserId, conversationId }) => {
    io.to(`user:${toUserId}`).emit('call:decline', { fromUserId: userId, conversationId });
  });

  socket.on('error', (err) => logger.warn(`Socket error for user ${userId}: ${err.message}`));
};

module.exports = registerChatHandlers;
