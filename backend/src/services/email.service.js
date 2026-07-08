const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!env.isSmtpConfigured) return null;
  if (transporter) return transporter;
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
};

/**
 * Sends an email via SMTP when configured, otherwise logs it to the console
 * so auth flows (verification, password reset) remain testable without a
 * real mail provider.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const client = getTransporter();

  if (!client) {
    logger.info(`[email:mock] To: ${to} | Subject: ${subject}`);
    logger.info(`[email:mock] Body: ${text || html}`);
    return { delivered: false, mock: true };
  }

  await client.sendMail({ from: env.smtp.from, to, subject, html, text });
  return { delivered: true, mock: false };
};

const sendVerificationEmail = (to, token) =>
  sendEmail({
    to,
    subject: 'Verify your Mobile Sales account',
    text: `Verify your email using this link: ${env.clientUrl}/verify-email?token=${token}`,
    html: `<p>Verify your email using this link:</p><p><a href="${env.clientUrl}/verify-email?token=${token}">${env.clientUrl}/verify-email?token=${token}</a></p>`,
  });

const sendPasswordResetEmail = (to, token) =>
  sendEmail({
    to,
    subject: 'Reset your Mobile Sales password',
    text: `Reset your password using this link: ${env.clientUrl}/reset-password?token=${token}`,
    html: `<p>Reset your password using this link:</p><p><a href="${env.clientUrl}/reset-password?token=${token}">${env.clientUrl}/reset-password?token=${token}</a></p>`,
  });

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
