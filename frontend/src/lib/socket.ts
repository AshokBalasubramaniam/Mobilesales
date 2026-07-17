import { io, type Socket } from "socket.io-client";
import { env } from "../config/env";

let socket: Socket | null = null;

export const connectSocket = (token: string | null): Socket => {
  if (socket) return socket;
  socket = io(env.socketUrl, {
    auth: { token },
    autoConnect: true,
    withCredentials: true,
  });
  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = (): Socket | null => socket;
