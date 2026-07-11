const Joi = require('joi');

const password = Joi.string().min(8).max(128).required();
const phone = Joi.string().pattern(/^[6-9]\d{9}$/).message('Invalid Indian mobile number');
// tlds disabled: Joi's IANA TLD allowlist rejects legitimate internal/self-hosted
// domains (e.g. .local) and lags behind newly registered gTLDs.
const email = () => Joi.string().email({ tlds: { allow: false } });

const register = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: email().required(),
    phone: phone.optional(),
    password,
    role: Joi.string().valid('buyer', 'seller').default('buyer'),
  }),
};

const login = {
  body: Joi.object({
    email: email().required(),
    password: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
};

const googleLogin = {
  body: Joi.object({
    idToken: Joi.string().required(),
    role: Joi.string().valid('buyer', 'seller').default('buyer'),
  }),
};

const otpRequest = {
  body: Joi.object({
    phone: phone.required(),
  }),
};

const otpVerify = {
  body: Joi.object({
    phone: phone.required(),
    code: Joi.string().length(6).required(),
  }),
};

const verifyEmail = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object({
    email: email().required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    email: email().required(),
    code: Joi.string().pattern(/^\d{6}$/).message('OTP must be a 6-digit code').required(),
    password,
  }),
};

const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password,
  }),
};

module.exports = {
  register,
  login,
  refreshToken,
  googleLogin,
  otpRequest,
  otpVerify,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
