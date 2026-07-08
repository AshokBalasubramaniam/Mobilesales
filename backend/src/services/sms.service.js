const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Sends an OTP SMS via the configured provider's HTTP API when credentials
 * exist, otherwise logs the OTP to the console so login/OTP flows can be
 * exercised in development without an SMS account.
 */
const sendOtp = async (phone, otp) => {
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

module.exports = { sendOtp };
