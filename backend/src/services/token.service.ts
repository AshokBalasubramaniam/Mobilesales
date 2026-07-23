import jwt, { type JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import env from '../config/env';
import type { AuthenticatedUser } from '../types/express';

const msFromExpiresIn = (expiresIn: string): number => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 15 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unitMs: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * unitMs[match[2]];
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  family: string;
}

// `family` identifies one login session across refresh rotations (same value
// reused on every /auth/refresh-token call for that session). Omitting it
// starts a brand-new session (register/login/OTP/Google); passing the prior
// session's family keeps rotation within that same session so it can be
// listed/revoked as one logical device and so reuse of an already-rotated
// token can be traced back to it.
export const issueTokenPair = (user: AuthenticatedUser, family: string = randomUUID()): TokenPair => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken(family);
  const refreshExpiresAt = new Date(Date.now() + msFromExpiresIn(env.jwt.refreshExpiresIn));
  return { accessToken, refreshToken, refreshExpiresAt, family };
};

export const verifyRefreshToken = (token: string): JwtPayload | string => jwt.verify(token, env.jwt.refreshSecret);

export { msFromExpiresIn };
