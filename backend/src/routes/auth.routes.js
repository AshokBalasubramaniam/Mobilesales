const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter.middleware');
const authValidation = require('../validations/auth.validation');

const router = express.Router();

router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/google', authLimiter, validate(authValidation.googleLogin), authController.googleLogin);
router.post('/otp/request', otpLimiter, validate(authValidation.otpRequest), authController.requestOtp);
router.post('/otp/verify', authLimiter, validate(authValidation.otpVerify), authController.verifyOtp);
router.post('/refresh-token', validate(authValidation.refreshToken), authController.refreshTokenHandler);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/resend-verification', protect, authController.resendVerificationEmail);
router.post('/forgot-password', authLimiter, validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(authValidation.resetPassword), authController.resetPassword);
router.post('/change-password', protect, validate(authValidation.changePassword), authController.changePassword);

module.exports = router;
