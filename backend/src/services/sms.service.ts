import env from '../config/env';
import logger from '../utils/logger';

export interface SendOtpResult {
  delivered: boolean;
  mock: boolean;
}

/**
 * Sends an OTP SMS via the configured provider's HTTP API when credentials
 * exist, otherwise logs the OTP to the console so login/OTP flows can be
 * exercised in development without an SMS account.
 */
export const sendOtp = async (phone: string, otp: string): Promise<SendOtpResult> => {
  if (!env.isSmsConfigured) {
    logger.info(`[sms:mock] OTP for ${phone}: ${otp}`);
    return { delivered: false, mock: true };
  }

  await fetch('https://api.sms-provider.example.com/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.sms.apiKey}` },
    body: JSON.stringify({ to: phone, sender: env.sms.senderId, message: `Your Mobile Sales OTP is ${otp}` }),
  });

  return { delivered: true, mock: false };
};
