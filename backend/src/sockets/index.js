const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const logger = require('../utils/logger');
const registerChatHandlers = require('./chatSocket');

let io = null;
/** userId (string) -> Set of connected socket ids, for multi-device presence */
const onlineUsers = new Map();

const userRoom = (userId) => `user:${userId}`;

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Authentication token missing'));

    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(payload.sub);
    if (!user || user.isBlocked) return next(new Error('Unauthorized'));

    socket.userId = user._id.toString();
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
};

const initSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const { userId } = socket;
    socket.join(userRoom(userId));

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    if (onlineUsers.get(userId).size === 1) {
      socket.broadcast.emit('presence:online', { userId });
    }

    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:offline', { userId, lastSeen: new Date() });
        }
      }
    });

    logger.debug(`Socket connected: user=${userId} socket=${socket.id}`);
  });

  return io;
};

const getIO = () => io;

const isUserOnline = (userId) => onlineUsers.has(userId.toString());

const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(userRoom(userId.toString())).emit(event, payload);
};

module.exports = { initSocketIO, getIO, isUserOnline, emitToUser, userRoom };
