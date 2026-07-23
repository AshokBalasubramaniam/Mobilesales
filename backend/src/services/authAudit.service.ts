import AuthEvent from '../models/AuthEvent';
import logger from '../utils/logger';
import type { AuthEventType } from '../types/models';

export interface LogAuthEventArgs {
  type: AuthEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}

// Audit logging must never break the auth flow it's observing, so a write
// failure here is swallowed (and reported to the app logger) instead of
// thrown back into the caller.
export const logAuthEvent = async ({ type, userId, email, ip, userAgent, meta }: LogAuthEventArgs): Promise<void> => {
  try {
    await AuthEvent.create({ type, user: userId, email, ip, userAgent, meta });
  } catch (err) {
    logger.warn(`Failed to write auth audit log (${type}): ${(err as Error).message}`);
  }
};
