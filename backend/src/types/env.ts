export interface Env {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  apiUrl: string;

  mongoUri: string;

  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  refreshCookieName: string;

  redisUrl: string;

  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    cloudfrontDomain: string;
  };
  readonly isS3Configured: boolean;

  razorpay: {
    keyId: string;
    keySecret: string;
  };
  readonly isRazorpayConfigured: boolean;

  google: {
    clientId: string;
  };
  readonly isGoogleConfigured: boolean;

  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
  readonly isFirebaseConfigured: boolean;

  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  readonly isCloudinaryConfigured: boolean;

  resend: {
    apiKey: string;
    from: string;
  };
  readonly isEmailConfigured: boolean;

  admin: {
    email: string;
    password: string;
  };

  rateLimit: {
    windowMs: number;
    max: number;
  };

  bruteForce: {
    maxAttempts: number;
    windowMs: number;
    lockBaseMs: number;
    lockMaxMs: number;
    progressiveDelayMs: number;
  };

  toBool: (val: unknown) => boolean;
}
