import jwt, { type JwtPayload } from 'jsonwebtoken';
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
}

export const issueTokenPair = (user: AuthenticatedUser): TokenPair => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + msFromExpiresIn(env.jwt.refreshExpiresIn));
  return { accessToken, refreshToken, refreshExpiresAt };
};

export const verifyRefreshToken = (token: string): JwtPayload | string => jwt.verify(token, env.jwt.refreshSecret);

export { msFromExpiresIn };
