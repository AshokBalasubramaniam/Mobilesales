import { OAuth2Client } from 'google-auth-library';
import env from '../config/env';
import ApiError from '../utils/ApiError';

let client: OAuth2Client | null = null;

const getClient = (): OAuth2Client => {
  if (!client) client = new OAuth2Client(env.google.clientId);
  return client;
};

export interface GoogleProfile {
  googleId?: string;
  email?: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
}

/**
 * Verifies a Google ID token from the frontend and returns the profile.
 * Throws if Google OAuth has not been configured with a client ID.
 */
export const verifyGoogleToken = async (idToken: string): Promise<GoogleProfile> => {
  if (!env.isGoogleConfigured) {
    throw ApiError.badRequest('Google login is not configured on this server');
  }

  const ticket = await getClient().verifyIdToken({ idToken, audience: env.google.clientId });
  const payload = ticket.getPayload();
  if (!payload) throw ApiError.unauthorized('Invalid Google token');

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    emailVerified: payload.email_verified,
  };
};
