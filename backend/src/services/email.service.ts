import type { Transporter } from 'nodemailer';
import env from '../config/env';
import logger from '../utils/logger';

const BRAND_NAME = 'Mobile Sales';
const BRAND_COLOR = '#4f46e5';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!env.isSmtpConfigured) return null;
  if (transporter) return transporter;
  // eslint-disable-next-line global-require
  const nodemailer: typeof import('nodemailer') = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
};

export interface SendEmailArgs {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SendEmailResult {
  delivered: boolean;
  mock: boolean;
}

/**
 * Sends an email via SMTP when configured, otherwise logs it to the console
 * so auth flows (verification, password reset) remain testable without a
 * real mail provider. The mock path is logged at `warn` (not `info`) since an
 * unset SMTP_HOST/USER/PASS in production silently makes every "email sent"
 * response a no-op — this keeps that visible in server logs.
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailArgs): Promise<SendEmailResult> => {
  const client = getTransporter();

  if (!client) {
    logger.warn(`[email:mock] SMTP is not configured — no real email was sent. To: ${to} | Subject: ${subject}`);
    logger.info(`[email:mock] Body: ${text || html}`);
    return { delivered: false, mock: true };
  }

  await client.sendMail({ from: env.smtp.from, to, subject, html, text });
  return { delivered: true, mock: false };
};

const emailLayout = (title: string, bodyHtml: string): string => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_COLOR};padding:24px 32px;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;">${BRAND_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#111827;">
                <h1 style="margin:0 0 12px;font-size:18px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f9fafb;color:#6b7280;font-size:12px;">
                &copy; ${new Date().getFullYear()} ${BRAND_NAME} &mdash; buy &amp; sell used phones safely.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const sendVerificationEmail = (to: string, token: string): Promise<SendEmailResult> => {
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: `Verify your ${BRAND_NAME} account`,
    text: `Verify your email using this link: ${link}`,
    html: emailLayout(
      'Verify your email address',
      `<p style="margin:0 0 20px;font-size:14px;color:#374151;">Thanks for signing up! Click the button below to verify your email address.</p>
       <p style="text-align:center;margin:0 0 20px;">
         <a href="${link}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;font-size:14px;">Verify Email</a>
       </p>
       <p style="margin:0;font-size:12px;color:#9ca3af;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`
    ),
  });
};

export const sendPasswordResetOtpEmail = (to: string, code: string): Promise<SendEmailResult> =>
  sendEmail({
    to,
    subject: `Your ${BRAND_NAME} password reset code`,
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
    html: emailLayout(
      'Reset your password',
      `<p style="margin:0 0 20px;font-size:14px;color:#374151;">Use the code below to reset your password. It expires in 10 minutes.</p>
       <p style="text-align:center;margin:0 0 20px;">
         <span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#f3f4f6;font-size:28px;font-weight:700;letter-spacing:8px;color:${BRAND_COLOR};">${code}</span>
       </p>
       <p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't request a password reset, you can safely ignore this email.</p>`
    ),
  });
