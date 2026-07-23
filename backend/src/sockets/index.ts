import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import env from '../config/env';
import User from '../models/User';
import logger from '../utils/logger';
import registerChatHandlers from './chatSocket';
import type { AuthenticatedSocket } from '../types/socket';
import { registerSocketEvent, clearSocketRateLimit } from '../services/socketRateLimiter.service';

let io: Server | null = null;
/** userId (string) -> Set of connected socket ids, for multi-device presence */
const onlineUsers = new Map<string, Set<string>>();

const userRoom = (userId: string): string => `user:${userId}`;
const conversationRoom = (conversationId: string): string => `conversation:${conversationId}`;

const authenticateSocket = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
  const ip = socket.handshake.address;
  try {
    const authToken = socket.handshake.auth?.token as string | undefined;
    const headerToken = socket.handshake.headers?.authorization?.replace('Bearer ', '');
    const token = authToken || headerToken;
    if (!token) {
      logger.warn(`Socket auth rejected (no token): ip=${ip} socket=${socket.id}`);
      return next(new Error('Authentication token missing'));
    }

    const decoded = jwt.verify(token, env.jwt.accessSecret);
    if (typeof decoded === 'string') {
      logger.warn(`Socket auth rejected (malformed token): ip=${ip} socket=${socket.id}`);
      return next(new Error('Invalid or expired token'));
    }

    const user = await User.findById(decoded.sub);
    if (!user || user.isBlocked) {
      logger.warn(`Socket auth rejected (unauthorized): ip=${ip} socket=${socket.id} userId=${decoded.sub}`);
      return next(new Error('Unauthorized'));
    }

    const authenticated = socket as AuthenticatedSocket;
    authenticated.userId = user._id.toString();
    authenticated.role = user.role;
    logger.info(`Socket authenticated: user=${authenticated.userId} socket=${socket.id}`);
    next();
  } catch (err) {
    logger.warn(`Socket auth error: ip=${ip} socket=${socket.id} reason=${(err as Error).message}`);
    next(new Error('Invalid or expired token'));
  }
};

export const initSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
    // Engine.IO heartbeat: server pings every 25s, and considers the client
    // gone if no pong arrives within 20s — detects dead connections (dropped
    // wifi, sleeping laptop) without waiting for a TCP-level timeout.
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  io.engine.on('connection_error', (err) => {
    logger.warn(`Socket.IO engine connection error: code=${err.code} message=${err.message}`);
  });

  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    const { userId } = socket as AuthenticatedSocket;
    socket.join(userRoom(userId));

    // Per-socket packet middleware: rejects (and, on repeated abuse,
    // disconnects) a client sending events faster than a real user/UI could.
    socket.use((packet, next) => {
      const [event] = packet;
      const { limited, shouldDisconnect } = registerSocketEvent(socket.id);
      if (!limited) return next();

      logger.warn(`Socket rate limit exceeded: user=${userId} socket=${socket.id} event=${event}`);
      if (shouldDisconnect) {
        logger.warn(`Disconnecting abusive socket: user=${userId} socket=${socket.id}`);
        socket.disconnect(true);
        return;
      }
      next(new Error('Rate limit exceeded'));
    });

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)?.add(socket.id);

    if (onlineUsers.get(userId)?.size === 1) {
      socket.broadcast.emit('presence:online', { userId });
    }

    // Newly-connected clients only learn about presence changes that happen from now on,
    // so hand them a snapshot of who's already online.
    socket.emit('presence:snapshot', Array.from(onlineUsers.keys()));

    registerChatHandlers(io as Server, socket as AuthenticatedSocket);

    socket.on('disconnect', async (reason) => {
      clearSocketRateLimit(socket.id);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date();
          io?.emit('presence:offline', { userId, lastSeen });
          try {
            await User.findByIdAndUpdate(userId, { lastSeen });
          } catch (err) {
            logger.warn(`Failed to persist lastSeen for user ${userId}: ${(err as Error).message}`);
          }
        }
      }
      logger.info(`Socket disconnected: user=${userId} socket=${socket.id} reason=${reason}`);
    });

    logger.info(`Socket connected: user=${userId} socket=${socket.id}`);
  });

  return io;
};

export const getIO = (): Server | null => io;

export const isUserOnline = (userId: Types.ObjectId | string): boolean => onlineUsers.has(userId.toString());

export const emitToUser = (userId: Types.ObjectId | string, event: string, payload: unknown): void => {
  if (!io) return;
  io.to(userRoom(userId.toString())).emit(event, payload);
};

export const emitToConversation = (conversationId: Types.ObjectId | string, event: string, payload: unknown): void => {
  if (!io) return;
  io.to(conversationRoom(conversationId.toString())).emit(event, payload);
};

export { userRoom, conversationRoom };
