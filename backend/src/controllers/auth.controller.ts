import type { CookieOptions, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import env from '../config/env';
import logger from '../utils/logger';
import * as tokenService from '../services/token.service';
import * as emailService from '../services/email.service';
import * as smsService from '../services/sms.service';
import * as googleAuthService from '../services/googleAuth.service';
import { generateNumericOTP, generateToken, hashToken } from '../utils/otp';
import { AUTH_PROVIDER } from '../config/constants';
import type { AuthenticatedUser } from '../types/express';
import type { IRefreshToken } from '../types/models';
import type { Role } from '../types/constants';

// Frontend and backend are served from different domains in production
// (e.g. Netlify + Render), so the refresh cookie needs SameSite=None to be
// sent on cross-site XHR/fetch — which in turn requires Secure=true.
// Locally the Vite dev server proxies /api same-origin, so Lax is fine there.
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/api/auth',
};

const setRefreshCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(env.refreshCookieName, token, { ...REFRESH_COOKIE_OPTIONS, expires: expiresAt });
};

const issueSession = async (
  res: Response,
  user: AuthenticatedUser,
  req: Request
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { accessToken, refreshToken, refreshExpiresAt } = tokenService.issueTokenPair(user);

  user.refreshTokens = (user.refreshTokens || []).filter((rt) => rt.expiresAt > new Date());
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshExpiresAt,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  } as IRefreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  return { accessToken, refreshToken };
};

interface RegisterBody {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
}

export const register = asyncHandler(async (req: Request<ParamsDictionary, unknown, RegisterBody>, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  const existing = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
  if (existing) throw ApiError.conflict('An account with this email or phone already exists');

  const user = new User({ name, email, phone, password, role });

  const verificationToken = generateToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  try {
    await emailService.sendVerificationEmail(user.email, verificationToken);
  } catch (err) {
    logger.warn(`Failed to send verification email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
  }

  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(201, { user: user.toSafeJSON(), accessToken }, 'Registration successful').send(res);
});

interface LoginBody {
  email: string;
  password: string;
}

export const login = asyncHandler(async (req: Request<ParamsDictionary, unknown, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

  const { accessToken } = await issueSession(res, user, req);

  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Login successful').send(res);
});

interface GoogleLoginBody {
  idToken: string;
  role?: Role;
}

export const googleLogin = asyncHandler(async (req: Request<ParamsDictionary, unknown, GoogleLoginBody>, res: Response) => {
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

interface OtpRequestBody {
  phone: string;
}

export const requestOtp = asyncHandler(async (req: Request<ParamsDictionary, unknown, OtpRequestBody>, res: Response) => {
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

interface OtpVerifyBody {
  phone: string;
  code: string;
}

export const verifyOtp = asyncHandler(async (req: Request<ParamsDictionary, unknown, OtpVerifyBody>, res: Response) => {
  const { phone, code } = req.body;

  const user = await User.findOne({ phone }).select('+otp.codeHash +otp.purpose +otp.expiresAt +otp.attempts');
  if (!user || !user.otp?.codeHash) throw ApiError.badRequest('No OTP was requested for this number');
  if (user.otp.expiresAt! < new Date()) throw ApiError.badRequest('OTP has expired');
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

interface RefreshTokenBody {
  refreshToken?: string;
}

export const refreshTokenHandler = asyncHandler(async (req: Request<ParamsDictionary, unknown, RefreshTokenBody>, res: Response) => {
  const incomingToken = req.cookies?.[env.refreshCookieName] || req.body.refreshToken;
  if (!incomingToken) throw ApiError.unauthorized('Refresh token missing');

  let payload: JwtPayload;
  try {
    const decoded = tokenService.verifyRefreshToken(incomingToken);
    if (typeof decoded === 'string') throw new Error('Invalid token payload');
    payload = decoded;
  } catch {
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

export const logout = asyncHandler(async (req: Request<ParamsDictionary, unknown, RefreshTokenBody>, res: Response) => {
  const incomingToken = req.cookies?.[env.refreshCookieName] || req.body.refreshToken;
  if (incomingToken && req.user) {
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { token: incomingToken } } });
  }
  res.clearCookie(env.refreshCookieName, { path: '/api/auth' });
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  new ApiResponse(200, req.user!.toSafeJSON()).send(res);
});

interface VerifyEmailBody {
  token: string;
}

export const verifyEmail = asyncHandler(async (req: Request<ParamsDictionary, unknown, VerifyEmailBody>, res: Response) => {
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

export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.isEmailVerified) throw ApiError.badRequest('Email is already verified');

  const verificationToken = generateToken();
  req.user!.emailVerificationToken = hashToken(verificationToken);
  req.user!.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await req.user!.save();

  try {
    await emailService.sendVerificationEmail(req.user!.email, verificationToken);
  } catch (err) {
    logger.warn(`Failed to send verification email to ${req.user!.email}: ${err instanceof Error ? err.message : String(err)}`);
  }

  new ApiResponse(200, null, 'Verification email sent').send(res);
});

interface ForgotPasswordBody {
  email: string;
}

export const forgotPassword = asyncHandler(async (req: Request<ParamsDictionary, unknown, ForgotPasswordBody>, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return success to avoid leaking whether an email is registered.
  if (user) {
    const code = generateNumericOTP(6);
    user.passwordResetOtp = { codeHash: hashToken(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 };
    await user.save();
    try {
      await emailService.sendPasswordResetOtpEmail(user.email, code);
    } catch (err) {
      logger.warn(`Failed to send password reset email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  new ApiResponse(200, null, 'If that email is registered, a reset code has been sent').send(res);
});

interface ResetPasswordBody {
  email: string;
  code: string;
  password: string;
}

export const resetPassword = asyncHandler(async (req: Request<ParamsDictionary, unknown, ResetPasswordBody>, res: Response) => {
  const { email, code, password } = req.body;

  const user = await User.findOne({ email }).select(
    '+passwordResetOtp.codeHash +passwordResetOtp.expiresAt +passwordResetOtp.attempts +refreshTokens'
  );
  if (!user || !user.passwordResetOtp?.codeHash) throw ApiError.badRequest('No reset code was requested for this email');
  if (user.passwordResetOtp.expiresAt! < new Date()) throw ApiError.badRequest('Reset code has expired');
  if (user.passwordResetOtp.attempts >= 5) throw ApiError.badRequest('Too many incorrect attempts, request a new code');

  if (user.passwordResetOtp.codeHash !== hashToken(code)) {
    user.passwordResetOtp.attempts += 1;
    await user.save();
    throw ApiError.badRequest('Incorrect reset code');
  }

  user.password = password;
  user.passwordResetOtp = undefined;
  user.refreshTokens = []; // invalidate all existing sessions
  await user.save();

  new ApiResponse(200, null, 'Password reset successfully').send(res);
});

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = asyncHandler(async (req: Request<ParamsDictionary, unknown, ChangePasswordBody>, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!._id).select('+password +refreshTokens');

  if (!(await user!.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user!.password = newPassword;
  await user!.save();

  new ApiResponse(200, null, 'Password changed successfully').send(res);
});
