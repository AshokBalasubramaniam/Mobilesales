import type { CookieOptions, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { convertToApiError } from "../middleware/error.middleware";
import env from "../config/env";
import logger from "../utils/logger";
import * as tokenService from "../services/token.service";
import * as emailService from "../services/email.service";
import * as smsService from "../services/sms.service";
import * as googleAuthService from "../services/googleAuth.service";
import { generateNumericOTP, generateToken, hashToken } from "../utils/otp";
import { AUTH_PROVIDER } from "../config/constants";
import type { AuthenticatedUser } from "../types/express";
import type { IRefreshToken } from "../types/models";
import type { Role } from "../types/constants";

// Frontend and backend are served from different domains in production
// (e.g. Netlify + Render), so the refresh cookie needs SameSite=None to be
// sent on cross-site XHR/fetch — which in turn requires Secure=true.
// Locally the Vite dev server proxies /api same-origin, so Lax is fine there.
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  path: "/api/auth",
};

const setRefreshCookie = (
  res: Response,
  token: string,
  expiresAt: Date,
): void => {
  res.cookie(env.refreshCookieName, token, {
    ...REFRESH_COOKIE_OPTIONS,
    expires: expiresAt,
  });
};

const issueSession = async (
  res: Response,
  user: AuthenticatedUser,
  req: Request,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { accessToken, refreshToken, refreshExpiresAt } =
    tokenService.issueTokenPair(user);

  user.refreshTokens = (user.refreshTokens || []).filter(
    (rt) => rt.expiresAt > new Date(),
  );
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshExpiresAt,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  } as IRefreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  return { accessToken, refreshToken };
};

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface RegisterBody {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
}

export const register = async (
  req: Request<Record<string, never>, unknown, RegisterBody>,
  res: Response,
) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });
    if (existing) {
      return res.status(409).json({
        flag: "error",
        message: "An account with this email or phone already exists",
      });
    }

    const user = new User({ name, email, phone, password, role });

    const verificationToken = generateToken();
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (err) {
      logger.warn(
        `Failed to send verification email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const { accessToken } = await issueSession(res, user, req);

    res.status(201).json({
      flag: "success",
      data: { user: user.toSafeJSON(), accessToken },
      message: "Registration successful",
    });
  } catch (error) {
    sendError(res, "register user", error);
  }
};

interface LoginBody {
  email: string;
  password: string;
}

export const login = async (
  req: Request<Record<string, never>, unknown, LoginBody>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ flag: "error", message: "Invalid email or password" });
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ flag: "error", message: "Your account has been blocked" });
    }

    const { accessToken } = await issueSession(res, user, req);

    res.status(200).json({
      flag: "success",
      data: { user: user.toSafeJSON(), accessToken },
      message: "Login successful",
    });
  } catch (error) {
    sendError(res, "log in", error);
  }
};

interface GoogleLoginBody {
  idToken: string;
  role?: Role;
}

export const googleLogin = async (
  req: Request<Record<string, never>, unknown, GoogleLoginBody>,
  res: Response,
) => {
  try {
    const { idToken, role } = req.body;
    const profile = await googleAuthService.verifyGoogleToken(idToken);

    let user = await User.findOne({ email: profile.email }).select("+googleId");
    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        googleId: profile.googleId,
        authProvider: AUTH_PROVIDER.GOOGLE,
        isEmailVerified: profile.emailVerified,
        role: role || "buyer",
      });
    } else if (!user.googleId) {
      user.googleId = profile.googleId;
      user.authProvider = AUTH_PROVIDER.GOOGLE;
      if (profile.emailVerified) user.isEmailVerified = true;
      await user.save();
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ flag: "error", message: "Your account has been blocked" });
    }

    const { accessToken } = await issueSession(res, user, req);

    res.status(200).json({
      flag: "success",
      data: { user: user.toSafeJSON(), accessToken },
      message: "Google login successful",
    });
  } catch (error) {
    sendError(res, "log in with Google", error);
  }
};

interface OtpRequestBody {
  phone: string;
}

export const requestOtp = async (
  req: Request<Record<string, never>, unknown, OtpRequestBody>,
  res: Response,
) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: `User ${phone.slice(-4)}`,
        email: `${phone}@otp.mobilesales.local`,
        phone,
        role: "buyer",
      });
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ flag: "error", message: "Your account has been blocked" });
    }

    const code = generateNumericOTP(6);
    user.otp = {
      codeHash: hashToken(code),
      purpose: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    };
    await user.save();

    await smsService.sendOtp(phone, code);

    res
      .status(200)
      .json({ flag: "success", data: null, message: "OTP sent successfully" });
  } catch (error) {
    sendError(res, "send OTP", error);
  }
};

interface OtpVerifyBody {
  phone: string;
  code: string;
}

export const verifyOtp = async (
  req: Request<Record<string, never>, unknown, OtpVerifyBody>,
  res: Response,
) => {
  try {
    const { phone, code } = req.body;

    const user = await User.findOne({ phone }).select(
      "+otp.codeHash +otp.purpose +otp.expiresAt +otp.attempts",
    );
    if (!user || !user.otp?.codeHash) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "No OTP was requested for this number",
        });
    }
    if (user.otp.expiresAt! < new Date()) {
      return res
        .status(400)
        .json({ flag: "error", message: "OTP has expired" });
    }
    if (user.otp.attempts >= 5) {
      return res.status(400).json({
        flag: "error",
        message: "Too many incorrect attempts, request a new OTP",
      });
    }

    if (user.otp.codeHash !== hashToken(code)) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({ flag: "error", message: "Incorrect OTP" });
    }

    user.otp = undefined;
    user.isPhoneVerified = true;
    await user.save();

    const { accessToken } = await issueSession(res, user, req);

    res.status(200).json({
      flag: "success",
      data: { user: user.toSafeJSON(), accessToken },
      message: "OTP verified successfully",
    });
  } catch (error) {
    sendError(res, "verify OTP", error);
  }
};

interface RefreshTokenBody {
  refreshToken?: string;
}

export const refreshTokenHandler = async (
  req: Request<Record<string, never>, unknown, RefreshTokenBody>,
  res: Response,
) => {
  try {
    const incomingToken =
      req.cookies?.[env.refreshCookieName] || req.body.refreshToken;
    if (!incomingToken) {
      return res
        .status(401)
        .json({ flag: "error", message: "Refresh token missing" });
    }

    let payload: JwtPayload;
    try {
      const decoded = tokenService.verifyRefreshToken(incomingToken);
      if (typeof decoded === "string") throw new Error("Invalid token payload");
      payload = decoded;
    } catch {
      return res
        .status(401)
        .json({ flag: "error", message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(payload.sub).select("+refreshTokens");
    if (!user) {
      return res
        .status(401)
        .json({ flag: "error", message: "User no longer exists" });
    }

    const storedToken = user.refreshTokens.find(
      (rt) => rt.token === incomingToken,
    );
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ flag: "error", message: "Refresh token is no longer valid" });
    }

    // rotate: drop the used token, issue a new pair
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== incomingToken,
    );
    const { accessToken } = await issueSession(res, user, req);

    res
      .status(200)
      .json({
        flag: "success",
        data: { accessToken },
        message: "Token refreshed",
      });
  } catch (error) {
    sendError(res, "refresh token", error);
  }
};

export const logout = async (
  req: Request<Record<string, never>, unknown, RefreshTokenBody>,
  res: Response,
) => {
  try {
    const incomingToken =
      req.cookies?.[env.refreshCookieName] || req.body.refreshToken;
    if (incomingToken && req.user) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: { token: incomingToken } } },
      );
    }
    res.clearCookie(env.refreshCookieName, { path: "/api/auth" });
    res
      .status(200)
      .json({
        flag: "success",
        data: null,
        message: "Logged out successfully",
      });
  } catch (error) {
    sendError(res, "log out", error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ flag: "success", data: req.user!.toSafeJSON() });
  } catch (error) {
    sendError(res, "get current user", error);
  }
};

interface VerifyEmailBody {
  token: string;
}

export const verifyEmail = async (
  req: Request<Record<string, never>, unknown, VerifyEmailBody>,
  res: Response,
) => {
  try {
    const { token } = req.body;
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "Invalid or expired verification token",
        });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: null,
        message: "Email verified successfully",
      });
  } catch (error) {
    sendError(res, "verify email", error);
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    if (req.user!.isEmailVerified) {
      return res
        .status(400)
        .json({ flag: "error", message: "Email is already verified" });
    }

    const verificationToken = generateToken();
    req.user!.emailVerificationToken = hashToken(verificationToken);
    req.user!.emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    await req.user!.save();

    try {
      await emailService.sendVerificationEmail(
        req.user!.email,
        verificationToken,
      );
    } catch (err) {
      logger.warn(
        `Failed to send verification email to ${req.user!.email}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    res
      .status(200)
      .json({
        flag: "success",
        data: null,
        message: "Verification email sent",
      });
  } catch (error) {
    sendError(res, "resend verification email", error);
  }
};

interface ForgotPasswordBody {
  email: string;
}

export const forgotPassword = async (
  req: Request<Record<string, never>, unknown, ForgotPasswordBody>,
  res: Response,
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to avoid leaking whether an email is registered.
    if (user) {
      const code = generateNumericOTP(6);
      user.passwordResetOtp = {
        codeHash: hashToken(code),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      };
      await user.save();
      try {
        await emailService.sendPasswordResetOtpEmail(user.email, code);
      } catch (err) {
        logger.warn(
          `Failed to send password reset email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    res.status(200).json({
      flag: "success",
      data: null,
      message: "If that email is registered, a reset code has been sent",
    });
  } catch (error) {
    sendError(res, "process forgot password request", error);
  }
};

interface ResetPasswordBody {
  email: string;
  code: string;
  password: string;
}

export const resetPassword = async (
  req: Request<Record<string, never>, unknown, ResetPasswordBody>,
  res: Response,
) => {
  try {
    const { email, code, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+passwordResetOtp.codeHash +passwordResetOtp.expiresAt +passwordResetOtp.attempts +refreshTokens",
    );
    if (!user || !user.passwordResetOtp?.codeHash) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "No reset code was requested for this email",
        });
    }
    if (user.passwordResetOtp.expiresAt! < new Date()) {
      return res
        .status(400)
        .json({ flag: "error", message: "Reset code has expired" });
    }
    if (user.passwordResetOtp.attempts >= 5) {
      return res.status(400).json({
        flag: "error",
        message: "Too many incorrect attempts, request a new code",
      });
    }

    if (user.passwordResetOtp.codeHash !== hashToken(code)) {
      user.passwordResetOtp.attempts += 1;
      await user.save();
      return res
        .status(400)
        .json({ flag: "error", message: "Incorrect reset code" });
    }

    user.password = password;
    user.passwordResetOtp = undefined;
    user.refreshTokens = []; // invalidate all existing sessions
    await user.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: null,
        message: "Password reset successfully",
      });
  } catch (error) {
    sendError(res, "reset password", error);
  }
};

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  req: Request<Record<string, never>, unknown, ChangePasswordBody>,
  res: Response,
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id).select(
      "+password +refreshTokens",
    );

    if (!(await user!.comparePassword(currentPassword))) {
      return res
        .status(400)
        .json({ flag: "error", message: "Current password is incorrect" });
    }

    user!.password = newPassword;
    await user!.save();

    res
      .status(200)
      .json({
        flag: "success",
        data: null,
        message: "Password changed successfully",
      });
  } catch (error) {
    sendError(res, "change password", error);
  }
};
