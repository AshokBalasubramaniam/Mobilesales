const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const tokenService = require('../services/token.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const googleAuthService = require('../services/googleAuth.service');
const { generateNumericOTP, generateToken, hashToken } = require('../utils/otp');
const { AUTH_PROVIDER } = require('../config/constants');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/api/auth',
};

const setRefreshCookie = (res, token, expiresAt) => {
  res.cookie(env.refreshCookieName, token, { ...REFRESH_COOKIE_OPTIONS, expires: expiresAt });
};

const issueSession = async (res, user, req) => {
  const { accessToken, refreshToken, refreshExpiresAt } = tokenService.issueTokenPair(user);

  user.refreshTokens = (user.refreshTokens || []).filter((rt) => rt.expiresAt > new Date());
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshExpiresAt,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  user.lastLoginAt = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  const existing = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
  if (existing) throw ApiError.conflict('An account with this email or phone already exists');

  const user = new User({ name, email, phone, password, role });

  const verificationToken = generateToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await emailService.sendVerificationEmail(user.email, verificationToken);

  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(201, { user: user.toSafeJSON(), accessToken }, 'Registration successful').send(res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Login successful').send(res);
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;
  const profile = await googleAuthService.verifyGoogleToken(idToken);

  let user = await User.findOne({ email: profile.email }).select('+googleId');
  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      googleId: profile.googleId,
      authProvider: AUTH_PROVIDER.GOOGLE,
      isEmailVerified: profile.emailVerified,
      role: role || 'buyer',
    });
  } else if (!user.googleId) {
    user.googleId = profile.googleId;
    user.authProvider = AUTH_PROVIDER.GOOGLE;
    if (profile.emailVerified) user.isEmailVerified = true;
    await user.save();
  }
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Google login successful').send(res);
});

const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: `User ${phone.slice(-4)}`, email: `${phone}@otp.mobilesales.local`, phone, role: 'buyer' });
  }
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

  const code = generateNumericOTP(6);
  user.otp = { codeHash: hashToken(code), purpose: 'login', expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 };
  await user.save();

  await smsService.sendOtp(phone, code);

  new ApiResponse(200, null, 'OTP sent successfully').send(res);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  const user = await User.findOne({ phone }).select('+otp.codeHash +otp.purpose +otp.expiresAt +otp.attempts');
  if (!user || !user.otp?.codeHash) throw ApiError.badRequest('No OTP was requested for this number');
  if (user.otp.expiresAt < new Date()) throw ApiError.badRequest('OTP has expired');
  if (user.otp.attempts >= 5) throw ApiError.badRequest('Too many incorrect attempts, request a new OTP');

  if (user.otp.codeHash !== hashToken(code)) {
    user.otp.attempts += 1;
    await user.save();
    throw ApiError.badRequest('Incorrect OTP');
  }

  user.otp = undefined;
  user.isPhoneVerified = true;
  await user.save();

  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'OTP verified successfully').send(res);
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.refreshCookieName] || req.body.refreshToken;
  if (!incomingToken) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = tokenService.verifyRefreshToken(incomingToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const storedToken = user.refreshTokens.find((rt) => rt.token === incomingToken);
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  // rotate: drop the used token, issue a new pair
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== incomingToken);
  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(200, { accessToken }, 'Token refreshed').send(res);
});

const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.refreshCookieName] || req.body.refreshToken;
  if (incomingToken && req.user) {
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { token: incomingToken } } });
  }
  res.clearCookie(env.refreshCookieName, { path: '/api/auth' });
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user.toSafeJSON()).send(res);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired verification token');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  new ApiResponse(200, null, 'Email verified successfully').send(res);
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) throw ApiError.badRequest('Email is already verified');

  const verificationToken = generateToken();
  req.user.emailVerificationToken = hashToken(verificationToken);
  req.user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await req.user.save();

  await emailService.sendVerificationEmail(req.user.email, verificationToken);

  new ApiResponse(200, null, 'Verification email sent').send(res);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return success to avoid leaking whether an email is registered.
  if (user) {
    const resetToken = generateToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  new ApiResponse(200, null, 'If that email is registered, a reset link has been sent').send(res);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // invalidate all existing sessions
  await user.save();

  new ApiResponse(200, null, 'Password reset successfully').send(res);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password +refreshTokens');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  new ApiResponse(200, null, 'Password changed successfully').send(res);
});

module.exports = {
  register,
  login,
  googleLogin,
  requestOtp,
  verifyOtp,
  refreshTokenHandler,
  logout,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
