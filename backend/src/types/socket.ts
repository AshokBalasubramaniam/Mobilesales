import type { Socket } from 'socket.io';
import type { Role } from './constants';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  role: Role;
}

export type Ack = (response: { ok: boolean; error?: string }) => void;
