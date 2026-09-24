import type { CookieOptions, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { convertToApiError } from "../middleware/error.middleware";
import env from "../config/env";
import logger from "../utils/logger";
import * as tokenService from "../services/token.service";
import * as emailService from "../services/email.service";
import * as googleAuthService from "../services/googleAuth.service";
import * as firebaseAuthService from "../services/firebaseAuth.service";
import * as bruteForce from "../services/bruteForce.service";
import { logAuthEvent } from "../services/authAudit.service";
import { generateNumericOTP, hashToken } from "../utils/otp";
import { parseUserAgent } from "../utils/parseUserAgent";
import { AUTH_PROVIDER, ROLES } from "../config/constants";
import type { AuthenticatedUser } from "../types/express";
import type { IRefreshToken } from "../types/models";

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

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

/**
 * Whether this login/register isn't coming from any device already on file
 * for this user — a best-effort heuristic (see parseUserAgent) used only to
 * decide whether to send a "new device" email, not a security boundary.
 */
const isNewDevice = (user: AuthenticatedUser, ip?: string, userAgent?: string): boolean =>
  !(user.refreshTokens || []).some((rt) => rt.ip === ip && rt.userAgent === userAgent);

const issueSession = async (
  res: Response,
  user: AuthenticatedUser,
  req: Request,
  family?: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { accessToken, refreshToken, refreshExpiresAt, family: sessionFamily } =
    tokenService.issueTokenPair(user, family);

  user.refreshTokens = (user.refreshTokens || []).filter(
    (rt) => rt.expiresAt > new Date(),
  );
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshExpiresAt,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    family: sessionFamily,
  } as IRefreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  return { accessToken, refreshToken };
};

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res.status(apiError.statusCode).json({
    flag: "error",
    message: apiError.message,
    ...(apiError.errors.length > 0 && { errors: apiError.errors }),
  });
};

const sendEmailVerificationOtp = async (user: AuthenticatedUser): Promise<void> => {
  const code = generateNumericOTP(6);
  user.otp = {
    codeHash: hashToken(code),
    purpose: "email_verify",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
  };
  await user.save();

  try {
    await emailService.sendVerificationEmail(user.email, code);
  } catch (err) {
    logger.warn(
      `Failed to send verification email to ${user.email}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
};

interface RegisterBody {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export const register = async (
  req: Request<Record<string, never>, unknown, RegisterBody>,
  res: Response,
) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });
    if (existing) {
      return res.status(409).json({
        flag: "error",
        message: "An account with this email or phone already exists",
      });
    }

    const user = new User({ name, email, phone, password, role: ROLES.BUYER });
    await sendEmailVerificationOtp(user);

    const { accessToken } = await issueSession(res, user, req);
    await logAuthEvent({ type: "register", userId: user._id.toString(), email, ip: req.ip, userAgent: req.headers["user-agent"] });

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
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const ipKey = `ip:${ip}`;

    // Per-IP lock guards against one attacker spraying many accounts from a
    // single source, independent of whether any single account is locked.
    const ipLock = await bruteForce.checkLock(ipKey);
    if (ipLock) {
      return res.status(429).json({
        flag: "error",
        message: `Too many failed attempts from this network. Try again after ${ipLock.toISOString()}`,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    const acctKey = user ? `acct:${user._id.toString()}` : null;

    if (acctKey) {
      const acctLock = await bruteForce.checkLock(acctKey);
      if (acctLock) {
        await logAuthEvent({ type: "login_locked", userId: user!._id.toString(), email, ip, userAgent, meta: { lockUntil: acctLock } });
        return res.status(423).json({
          flag: "error",
          message: `This account is temporarily locked due to repeated failed attempts. Try again after ${acctLock.toISOString()}`,
        });
      }
    }

    const passwordValid = user ? await user.comparePassword(password) : false;
    if (!user || !passwordValid) {
      const ipResult = await bruteForce.registerFailedAttempt(ipKey);
      const acctResult = acctKey ? await bruteForce.registerFailedAttempt(acctKey) : null;
      await logAuthEvent({ type: "login_failed", userId: user?._id.toString(), email, ip, userAgent });

      if (acctResult?.locked) {
        await logAuthEvent({
          type: "account_locked",
          userId: user!._id.toString(),
          email,
          ip,
          userAgent,
          meta: { lockUntil: acctResult.lockUntil },
        });
      }

      // Slows down automated guessing before the hard lockout threshold hits,
      // without fully blocking attempts that are still within budget.
      const delayMs = Math.max(ipResult.delayMs, acctResult?.delayMs ?? 0);
      if (delayMs) await wait(delayMs);

      return res
        .status(401)
        .json({ flag: "error", message: "Invalid email or password" });
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ flag: "error", message: "Your account has been blocked" });
    }

    await bruteForce.resetAttempts(ipKey);
    await bruteForce.resetAttempts(acctKey!);

    const newDevice = isNewDevice(user, ip, userAgent);
    const { accessToken } = await issueSession(res, user, req);
    await logAuthEvent({ type: "login_success", userId: user._id.toString(), email, ip, userAgent });

    if (newDevice) {
      const device = parseUserAgent(userAgent);
      emailService.sendNewDeviceLoginEmail(user.email, { ...device, ip }).catch((err: Error) => {
        logger.warn(`Failed to send new-device login email to ${user.email}: ${err.message}`);
      });
      await logAuthEvent({ type: "new_device_login", userId: user._id.toString(), email, ip, userAgent, meta: { ...device } as Record<string, unknown> });
    }

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
}

export const googleLogin = async (
  req: Request<Record<string, never>, unknown, GoogleLoginBody>,
  res: Response,
) => {
  try {
    const { idToken } = req.body;
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
        role: ROLES.BUYER,
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
    await logAuthEvent({ type: "login_success", userId: user._id.toString(), email: user.email, ip: req.ip, userAgent: req.headers["user-agent"], meta: { provider: "google" } });

    res.status(200).json({
      flag: "success",
      data: { user: user.toSafeJSON(), accessToken },
      message: "Google login successful",
    });
  } catch (error) {
    sendError(res, "log in with Google", error);
  }
};

interface FirebaseLoginBody {
  idToken: string;
  name?: string;
  email?: string;
  password?: string;
}

/**
 * Completes login/signup for a phone number Firebase's client SDK has
 * already verified via signInWithPhoneNumber() + OTP — this endpoint only
 * verifies Firebase's ID token and issues our own session, it does not
 * generate or check an OTP itself.
 *
 * A known number logs straight in on the verified token alone. An unknown
 * number is not silently auto-registered: without name+password this
 * responds with requiresRegistration so the client can collect them first,
 * then resubmit the same idToken (still valid) along with those fields.
 */
export const firebaseLogin = async (
  req: Request<Record<string, never>, unknown, FirebaseLoginBody>,
  res: Response,
) => {
  try {
    const { idToken, name, email, password } = req.body;
    const profile = await firebaseAuthService.verifyFirebaseToken(idToken);

    let user = await User.findOne({ phone: profile.phone });
    if (!user) {
      if (!name || !email || !password) {
        return res.status(200).json({
          flag: "success",
          data: { requiresRegistration: true, phone: profile.phone },
          message: "No account found for this number",
        });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          flag: "error",
          message: "An account with this email already exists",
        });
      }

      user = await User.create({
        name,
        email,
        phone: profile.phone,
        password,
        authProvider: AUTH_PROVIDER.FIREBASE,
        isPhoneVerified: true,
        role: ROLES.BUYER,
      });
    } else if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      await user.save();
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ flag: "error", message: "Your account has been blocked" });
    }

    const { accessToken } = await issueSession(res, user, req);
    await logAuthEvent({ type: "login_success", userId: user._id.toString(), email: user.email, ip: req.ip, userAgent: req.headers["user-agent"], meta: { provider: "firebase" } });

    res.status(200).json({
      flag: "success",
      data: { user: user.toSafeJSON(), accessToken },
      message: "Phone login successful",
    });
  } catch (error) {
    sendError(res, "log in with phone", error);
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
      // The token's signature verified (it's genuinely one we issued), but it's
      // not in the user's active set — most likely a rotated-out token being
      // replayed by whoever stole it earlier. Kill every session in the same
      // family so the thief's session dies along with the legitimate one.
      const reusedFamily = payload.family as string | undefined;
      const revoked = reusedFamily ? user.refreshTokens.filter((rt) => rt.family === reusedFamily) : [];
      if (revoked.length > 0) {
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.family !== reusedFamily);
        await user.save();
        await logAuthEvent({
          type: "token_reuse_detected",
          userId: user._id.toString(),
          email: user.email,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          meta: { family: reusedFamily, revokedSessions: revoked.length },
        });
      }
      return res
        .status(401)
        .json({ flag: "error", message: "Refresh token is no longer valid" });
    }

    // rotate: drop the used token, issue a new pair in the same session family
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== incomingToken,
    );
    const { accessToken } = await issueSession(res, user, req, storedToken.family);

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
      await logAuthEvent({ type: "logout", userId: req.user._id.toString(), email: req.user.email, ip: req.ip, userAgent: req.headers["user-agent"] });
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

/** Active sessions (one per device/browser) derived from the user's refresh-token list. */
export const listSessions = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select("+refreshTokens");
    const cookieToken = req.cookies?.[env.refreshCookieName];

    let currentFamily: string | undefined;
    if (cookieToken) {
      try {
        const decoded = tokenService.verifyRefreshToken(cookieToken);
        if (typeof decoded !== "string") currentFamily = decoded.family as string | undefined;
      } catch {
        // No cookie (e.g. a non-browser client) or an expired one — just
        // means no session in the list gets flagged "current", not fatal.
      }
    }

    const sessions = (user?.refreshTokens ?? [])
      .filter((rt) => rt.expiresAt > new Date())
      .map((rt) => ({
        family: rt.family,
        device: parseUserAgent(rt.userAgent),
        ip: rt.ip,
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
        current: rt.family === currentFamily,
      }));

    res.status(200).json({ flag: "success", data: sessions });
  } catch (error) {
    sendError(res, "list sessions", error);
  }
};

/** Revokes a single session/device by family, without touching the caller's other sessions. */
export const revokeSession = async (
  req: Request<{ family: string }>,
  res: Response,
) => {
  try {
    const { family } = req.params;
    await User.updateOne(
      { _id: req.user!._id },
      { $pull: { refreshTokens: { family } } },
    );
    await logAuthEvent({ type: "session_revoked", userId: req.user!._id.toString(), email: req.user!.email, ip: req.ip, userAgent: req.headers["user-agent"], meta: { family } });

    res.status(200).json({ flag: "success", data: null, message: "Session revoked" });
  } catch (error) {
    sendError(res, "revoke session", error);
  }
};

/** Logs the user out of every device by clearing all refresh tokens, including this one. */
export const revokeAllSessions = async (req: Request, res: Response) => {
  try {
    await User.updateOne({ _id: req.user!._id }, { $set: { refreshTokens: [] } });
    await logAuthEvent({ type: "logout_all", userId: req.user!._id.toString(), email: req.user!.email, ip: req.ip, userAgent: req.headers["user-agent"] });

    res.clearCookie(env.refreshCookieName, { path: "/api/auth" });
    res.status(200).json({ flag: "success", data: null, message: "Logged out of all devices" });
  } catch (error) {
    sendError(res, "log out of all devices", error);
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
  email: string;
  code: string;
}

export const verifyEmail = async (
  req: Request<Record<string, never>, unknown, VerifyEmailBody>,
  res: Response,
) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email }).select(
      "+otp.codeHash +otp.purpose +otp.expiresAt +otp.attempts",
    );
    if (!user || user.otp?.purpose !== "email_verify" || !user.otp?.codeHash) {
      return res
        .status(400)
        .json({ flag: "error", message: "No verification code was requested for this email" });
    }
    if (user.otp.expiresAt! < new Date()) {
      return res
        .status(400)
        .json({ flag: "error", message: "Verification code has expired" });
    }
    if (user.otp.attempts >= 5) {
      return res.status(400).json({
        flag: "error",
        message: "Too many incorrect attempts, request a new code",
      });
    }

    if (user.otp.codeHash !== hashToken(code)) {
      user.otp.attempts += 1;
      await user.save();
      return res
        .status(400)
        .json({ flag: "error", message: "Incorrect verification code" });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
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

    await sendEmailVerificationOtp(req.user!);

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
      await logAuthEvent({ type: "password_reset_requested", userId: user._id.toString(), email: user.email, ip: req.ip, userAgent: req.headers["user-agent"] });
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
    await logAuthEvent({ type: "password_reset", userId: user._id.toString(), email: user.email, ip: req.ip, userAgent: req.headers["user-agent"] });

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
    await logAuthEvent({ type: "password_changed", userId: user!._id.toString(), email: user!.email, ip: req.ip, userAgent: req.headers["user-agent"] });

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
