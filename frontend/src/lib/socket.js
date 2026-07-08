import { io } from 'socket.io-client';
import { env } from '../config/env';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;
  socket = io(env.socketUrl, { auth: { token }, autoConnect: true, withCredentials: true });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
