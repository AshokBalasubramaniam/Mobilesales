import axiosClient from './axiosClient';

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  googleLogin: (payload) => axiosClient.post('/auth/google', payload),
  requestOtp: (phone) => axiosClient.post('/auth/otp/request', { phone }),
  verifyOtp: (payload) => axiosClient.post('/auth/otp/verify', payload),
  logout: () => axiosClient.post('/auth/logout'),
  me: () => axiosClient.get('/auth/me'),
  verifyEmail: (token) => axiosClient.post('/auth/verify-email', { token }),
  resendVerification: () => axiosClient.post('/auth/resend-verification'),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosClient.post('/auth/reset-password', payload),
  changePassword: (payload) => axiosClient.post('/auth/change-password', payload),
};
