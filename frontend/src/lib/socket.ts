import { io, type Socket } from "socket.io-client";
import { env } from "../config/env";
import { getAccessToken } from "../api/tokenManager";

let socket: Socket | null = null;

// auth as a callback (rather than a static object) is re-invoked by socket.io-client
// on every reconnection attempt, so a rotated access token is always picked up —
// a stale token captured once at connect time would otherwise fail every reconnect
// after the original token expires.
export const connectSocket = (): Socket => {
  if (socket) return socket;
  socket = io(env.socketUrl, {
    auth: (cb) => cb({ token: getAccessToken() }),
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = (): Socket | null => socket;
