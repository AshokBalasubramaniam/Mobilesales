import crypto from 'crypto';

export const generateNumericOTP = (length = 6): string => {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(length, '0');
};

export const generateToken = (bytes = 32): string => crypto.randomBytes(bytes).toString('hex');

export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');
