import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import env from '../config/env';
import ApiError from '../utils/ApiError';

let app: App | null = null;

const getApp = (): App => {
  if (!app) {
    app = initializeApp({
      credential: cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      }),
    });
  }
  return app;
};

export interface FirebasePhoneProfile {
  uid: string;
  /** Bare 10-digit Indian mobile number, with the "+91" country code stripped. */
  phone: string;
}

/**
 * Verifies a Firebase ID token issued after the client completed phone OTP
 * verification via signInWithPhoneNumber(), and returns the verified phone
 * number. Throws if Firebase Admin has not been configured, the token is
 * invalid/expired, or it has no verified phone number on it.
 */
export const verifyFirebaseToken = async (idToken: string): Promise<FirebasePhoneProfile> => {
  if (!env.isFirebaseConfigured) {
    throw ApiError.badRequest('Phone login is not configured on this server');
  }

  let decoded;
  try {
    decoded = await getAuth(getApp()).verifyIdToken(idToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired phone verification token');
  }

  const phoneNumber = decoded.phone_number;
  if (!phoneNumber) {
    throw ApiError.unauthorized('Token does not contain a verified phone number');
  }

  return { uid: decoded.uid, phone: phoneNumber.replace(/^\+91/, '') };
};
