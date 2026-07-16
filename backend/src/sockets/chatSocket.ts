import type { Server } from 'socket.io';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import logger from '../utils/logger';
import { ROLES } from '../config/constants';
import type { AuthenticatedSocket, Ack } from '../types/socket';

const conversationRoom = (conversationId: string): string => `conversation:${conversationId}`;

const assertParticipant = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
  return conversation;
};

/**
 * Registers per-socket chat event handlers. Messages themselves are created
 * via REST (so uploads/validation go through one path); sockets handle the
 * realtime layer: room membership, typing, read receipts, and WebRTC call
 * signaling relay for video calls.
 */
const registerChatHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const { userId } = socket;

  socket.on('conversation:join', async (conversationId: string, ack?: Ack) => {
    // Admins aren't listed participants but can join any conversation for support/moderation.
    const conversation =
      socket.role === ROLES.ADMIN ? await Conversation.findById(conversationId) : await assertParticipant(conversationId, userId);
    if (!conversation) return ack?.({ ok: false, error: 'Not a participant of this conversation' });
    socket.join(conversationRoom(conversationId));
    ack?.({ ok: true });
  });

  socket.on('conversation:leave', (conversationId: string) => {
    socket.leave(conversationRoom(conversationId));
  });

  socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
    socket.to(conversationRoom(conversationId)).emit('typing:start', { conversationId, userId });
  });

  socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
    socket.to(conversationRoom(conversationId)).emit('typing:stop', { conversationId, userId });
  });

  socket.on('message:read', async ({ conversationId }: { conversationId: string }, ack?: Ack) => {
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
  socket.on('call:invite', ({ conversationId, toUserId, sdp }: { conversationId: string; toUserId: string; sdp: unknown }) => {
    io.to(`user:${toUserId}`).emit('call:invite', { conversationId, fromUserId: userId, sdp });
  });

  socket.on('call:answer', ({ toUserId, sdp }: { toUserId: string; sdp: unknown }) => {
    io.to(`user:${toUserId}`).emit('call:answer', { fromUserId: userId, sdp });
  });

  socket.on('call:ice-candidate', ({ toUserId, candidate }: { toUserId: string; candidate: unknown }) => {
    io.to(`user:${toUserId}`).emit('call:ice-candidate', { fromUserId: userId, candidate });
  });

  socket.on('call:end', ({ toUserId, conversationId }: { toUserId: string; conversationId: string }) => {
    io.to(`user:${toUserId}`).emit('call:end', { fromUserId: userId, conversationId });
  });

  socket.on('call:decline', ({ toUserId, conversationId }: { toUserId: string; conversationId: string }) => {
    io.to(`user:${toUserId}`).emit('call:decline', { fromUserId: userId, conversationId });
  });

  socket.on('error', (err: Error) => logger.warn(`Socket error for user ${userId}: ${err.message}`));
};

export default registerChatHandlers;
