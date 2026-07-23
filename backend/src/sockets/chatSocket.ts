import type { Server } from 'socket.io';
import type Joi from 'joi';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import logger from '../utils/logger';
import { ROLES } from '../config/constants';
import type { AuthenticatedSocket, Ack } from '../types/socket';
import {
  conversationIdSchema,
  typingSchema,
  messageReadSchema,
  callInviteSchema,
  callAnswerSchema,
  callIceCandidateSchema,
  callEndSchema,
} from '../validations/socket.validation';

const conversationRoom = (conversationId: string): string => `conversation:${conversationId}`;

const assertParticipant = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
  return conversation;
};

// Rejects a malformed payload before it reaches business logic (bad ObjectId,
// missing field, wrong type) instead of trusting whatever the client sent.
const validate = <T>(schema: Joi.Schema<T>, payload: unknown, ack?: Ack): T | null => {
  const { error, value } = schema.validate(payload);
  if (error) {
    logger.warn(`Invalid socket payload: ${error.message}`);
    ack?.({ ok: false, error: 'Invalid payload' });
    return null;
  }
  return value;
};

/**
 * Registers per-socket chat event handlers. Messages themselves are created
 * via REST (so uploads/validation go through one path); sockets handle the
 * realtime layer: room membership, typing, read receipts, and WebRTC call
 * signaling relay for video calls.
 */
const registerChatHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const { userId } = socket;

  socket.on('conversation:join', async (payload: string, ack?: Ack) => {
    const conversationId = validate(conversationIdSchema, payload, ack);
    if (!conversationId) return;

    // Admins aren't listed participants but can join any conversation for support/moderation.
    const conversation =
      socket.role === ROLES.ADMIN ? await Conversation.findById(conversationId) : await assertParticipant(conversationId, userId);
    if (!conversation) return ack?.({ ok: false, error: 'Not a participant of this conversation' });
    socket.join(conversationRoom(conversationId));
    ack?.({ ok: true });
  });

  socket.on('conversation:leave', (payload: string) => {
    const conversationId = validate(conversationIdSchema, payload);
    if (!conversationId) return;
    socket.leave(conversationRoom(conversationId));
  });

  socket.on('typing:start', (payload: unknown) => {
    const data = validate(typingSchema, payload);
    if (!data) return;
    socket.to(conversationRoom(data.conversationId)).emit('typing:start', { conversationId: data.conversationId, userId });
  });

  socket.on('typing:stop', (payload: unknown) => {
    const data = validate(typingSchema, payload);
    if (!data) return;
    socket.to(conversationRoom(data.conversationId)).emit('typing:stop', { conversationId: data.conversationId, userId });
  });

  socket.on('message:read', async (payload: unknown, ack?: Ack) => {
    const data = validate(messageReadSchema, payload, ack);
    if (!data) return;
    const { conversationId } = data;

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
  socket.on('call:invite', (payload: unknown) => {
    const data = validate(callInviteSchema, payload);
    if (!data) return;
    io.to(`user:${data.toUserId}`).emit('call:invite', { conversationId: data.conversationId, fromUserId: userId, sdp: data.sdp });
  });

  socket.on('call:answer', (payload: unknown) => {
    const data = validate(callAnswerSchema, payload);
    if (!data) return;
    io.to(`user:${data.toUserId}`).emit('call:answer', { fromUserId: userId, sdp: data.sdp });
  });

  socket.on('call:ice-candidate', (payload: unknown) => {
    const data = validate(callIceCandidateSchema, payload);
    if (!data) return;
    io.to(`user:${data.toUserId}`).emit('call:ice-candidate', { fromUserId: userId, candidate: data.candidate });
  });

  socket.on('call:end', (payload: unknown) => {
    const data = validate(callEndSchema, payload);
    if (!data) return;
    io.to(`user:${data.toUserId}`).emit('call:end', { fromUserId: userId, conversationId: data.conversationId });
  });

  socket.on('call:decline', (payload: unknown) => {
    const data = validate(callEndSchema, payload);
    if (!data) return;
    io.to(`user:${data.toUserId}`).emit('call:decline', { fromUserId: userId, conversationId: data.conversationId });
  });

  socket.on('error', (err: Error) => logger.warn(`Socket error for user ${userId}: ${err.message}`));
};

export default registerChatHandlers;
