import { Router } from 'express';
import {
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
} from '../controllers/auth.controller';
import validate from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleware';
import * as authValidation from '../validations/auth.validation';

const router = Router();

router.post('/register', authLimiter, validate(authValidation.register), register);
router.post('/login', authLimiter, validate(authValidation.login), login);
router.post('/google', authLimiter, validate(authValidation.googleLogin), googleLogin);
router.post('/otp/request', otpLimiter, validate(authValidation.otpRequest), requestOtp);
router.post('/otp/verify', authLimiter, validate(authValidation.otpVerify), verifyOtp);
router.post('/refresh-token', validate(authValidation.refreshToken), refreshTokenHandler);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', validate(authValidation.verifyEmail), verifyEmail);
router.post('/resend-verification', authenticateToken, resendVerificationEmail);
router.post('/forgot-password', authLimiter, validate(authValidation.forgotPassword), forgotPassword);
router.post('/reset-password', authLimiter, validate(authValidation.resetPassword), resetPassword);
router.post('/change-password', authenticateToken, validate(authValidation.changePassword), changePassword);

export default router;
