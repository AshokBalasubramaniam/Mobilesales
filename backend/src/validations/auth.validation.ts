import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

const password = Joi.string().min(8).max(128).required();
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

export const otpRequest: ValidationSchema = {
  body: Joi.object({
    phone: phone.required(),
  }),
};

export const otpVerify: ValidationSchema = {
  body: Joi.object({
    phone: phone.required(),
    code: Joi.string().length(6).required(),
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
