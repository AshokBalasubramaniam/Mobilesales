import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import env from '../config/env';
import User from '../models/User';
import logger from '../utils/logger';
import registerChatHandlers from './chatSocket';
import type { AuthenticatedSocket } from '../types/socket';

let io: Server | null = null;
/** userId (string) -> Set of connected socket ids, for multi-device presence */
const onlineUsers = new Map<string, Set<string>>();

const userRoom = (userId: string): string => `user:${userId}`;
const conversationRoom = (conversationId: string): string => `conversation:${conversationId}`;

const authenticateSocket = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
  try {
    const authToken = socket.handshake.auth?.token as string | undefined;
    const headerToken = socket.handshake.headers?.authorization?.replace('Bearer ', '');
    const token = authToken || headerToken;
    if (!token) return next(new Error('Authentication token missing'));

    const decoded = jwt.verify(token, env.jwt.accessSecret);
    if (typeof decoded === 'string') return next(new Error('Invalid or expired token'));

    const user = await User.findById(decoded.sub);
    if (!user || user.isBlocked) return next(new Error('Unauthorized'));

    const authenticated = socket as AuthenticatedSocket;
    authenticated.userId = user._id.toString();
    authenticated.role = user.role;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
};

export const initSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    const { userId } = socket as AuthenticatedSocket;
    socket.join(userRoom(userId));

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)?.add(socket.id);

    if (onlineUsers.get(userId)?.size === 1) {
      socket.broadcast.emit('presence:online', { userId });
    }

    // Newly-connected clients only learn about presence changes that happen from now on,
    // so hand them a snapshot of who's already online.
    socket.emit('presence:snapshot', Array.from(onlineUsers.keys()));

    registerChatHandlers(io as Server, socket as AuthenticatedSocket);

    socket.on('disconnect', async () => {
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
    });

    logger.debug(`Socket connected: user=${userId} socket=${socket.id}`);
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
