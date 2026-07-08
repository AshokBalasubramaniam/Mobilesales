const dotenv = require('dotenv');

dotenv.config();

const toBool = (val) => val === 'true' || val === true;

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
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

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Mobile Sales <no-reply@mobilesales.local>',
  },
  get isSmtpConfigured() {
    return Boolean(this.smtp.host && this.smtp.user && this.smtp.pass);
  },

  sms: {
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || '',
  },
  get isSmsConfigured() {
    return Boolean(this.sms.apiKey);
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mobilesales.local',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  },

  toBool,
};

module.exports = env;
