import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

// A short list of the most commonly leaked/guessed passwords (per breach
// corpora like rockyou.txt) — not exhaustive, just enough to block the
// laziest choices that pattern rules alone (upper/lower/digit/symbol) don't.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwerty123', 'qwertyuiop', 'letmein', 'iloveyou', 'admin123', 'welcome1',
  'abc12345', '1q2w3e4r', 'football', 'monkey123', 'trustno1', 'dragon123',
  'sunshine1', 'princess1',
]);

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[a-z]/, { name: 'lowercase letter' })
  .pattern(/[A-Z]/, { name: 'uppercase letter' })
  .pattern(/[0-9]/, { name: 'number' })
  .pattern(/[^a-zA-Z0-9]/, { name: 'special character' })
  .custom((value: string, helpers) => (COMMON_PASSWORDS.has(value.toLowerCase()) ? helpers.error('password.common') : value))
  .messages({
    'string.pattern.name': 'Password must contain at least one {#name}',
    'password.common': 'This password is too common — please choose a stronger one',
  })
  .required();
const phone = Joi.string().pattern(/^[6-9]\d{9}$/).message('Invalid Indian mobile number');
// tlds disabled: Joi's IANA TLD allowlist rejects legitimate internal/self-hosted
// domains (e.g. .local) and lags behind newly registered gTLDs.
const email = () => Joi.string().email({ tlds: { allow: false } });

export const register: ValidationSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: email().required(),
    phone: phone.optional(),
    password,
    role: Joi.string().valid('buyer', 'seller').default('buyer'),
  }),
};

export const login: ValidationSchema = {
  body: Joi.object({
    email: email().required(),
    password: Joi.string().required(),
  }),
};

export const refreshToken: ValidationSchema = {
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
};

export const googleLogin: ValidationSchema = {
  body: Joi.object({
    idToken: Joi.string().required(),
    role: Joi.string().valid('buyer', 'seller').default('buyer'),
  }),
};

export const firebaseLogin: ValidationSchema = {
  body: Joi.object({
    idToken: Joi.string().required(),
    // Only required when the number has no account yet — the controller
    // decides that after verifying the token, so both stay optional here.
    name: Joi.string().min(2).max(100).optional(),
    password: password.optional(),
    role: Joi.string().valid('buyer', 'seller').default('buyer'),
  }),
};

export const verifyEmail: ValidationSchema = {
  body: Joi.object({
    email: email().required(),
    code: Joi.string().pattern(/^\d{6}$/).message('Code must be a 6-digit number').required(),
  }),
};

export const forgotPassword: ValidationSchema = {
  body: Joi.object({
    email: email().required(),
  }),
};

export const resetPassword: ValidationSchema = {
  body: Joi.object({
    email: email().required(),
    code: Joi.string().pattern(/^\d{6}$/).message('OTP must be a 6-digit code').required(),
    password,
  }),
};

export const changePassword: ValidationSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password,
  }),
};
