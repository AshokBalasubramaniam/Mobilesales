import dotenv from 'dotenv';
import type { Env } from '../types/env';

dotenv.config();

const toBool = (val: unknown): boolean => val === 'true' || val === true;

const env: Env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mobilesales',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'msm_refresh_token',

  redisUrl: process.env.REDIS_URL || '',

  aws: {
    region: process.env.AWS_REGION || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucket: process.env.AWS_S3_BUCKET || '',
    cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || '',
  },
  get isS3Configured() {
    return Boolean(this.aws.region && this.aws.accessKeyId && this.aws.secretAccessKey && this.aws.bucket);
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  get isRazorpayConfigured() {
    return Boolean(this.razorpay.keyId && this.razorpay.keySecret);
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },
  get isGoogleConfigured() {
    return Boolean(this.google.clientId);
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    // .env stores the PEM's newlines escaped as literal "\n" sequences.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  get isFirebaseConfigured() {
    return Boolean(this.firebase.projectId && this.firebase.clientEmail && this.firebase.privateKey);
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  get isCloudinaryConfigured() {
    return Boolean(this.cloudinary.cloudName && this.cloudinary.apiKey && this.cloudinary.apiSecret);
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'Mobile Sales <onboarding@resend.dev>',
  },
  get isEmailConfigured() {
    return Boolean(this.resend.apiKey);
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mobilesales.local',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 300,
  },

  bruteForce: {
    maxAttempts: Number(process.env.BRUTE_FORCE_MAX_ATTEMPTS) || 5,
    windowMs: Number(process.env.BRUTE_FORCE_WINDOW_MS) || 15 * 60 * 1000,
    lockBaseMs: Number(process.env.BRUTE_FORCE_LOCK_BASE_MS) || 60 * 1000,
    lockMaxMs: Number(process.env.BRUTE_FORCE_LOCK_MAX_MS) || 24 * 60 * 60 * 1000,
    progressiveDelayMs: Number(process.env.BRUTE_FORCE_PROGRESSIVE_DELAY_MS) || 500,
  },

  toBool,
};

export default env;
