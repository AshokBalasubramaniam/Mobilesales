const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

let client = null;

const getClient = () => {
  if (!client) client = new OAuth2Client(env.google.clientId);
  return client;
};

/**
 * Verifies a Google ID token from the frontend and returns the profile.
 * Throws if Google OAuth has not been configured with a client ID.
 */
const verifyGoogleToken = async (idToken) => {
  if (!env.isGoogleConfigured) {
    throw ApiError.badRequest('Google login is not configured on this server');
  }

  const ticket = await getClient().verifyIdToken({ idToken, audience: env.google.clientId });
  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    emailVerified: payload.email_verified,
  };
};

module.exports = { verifyGoogleToken };
