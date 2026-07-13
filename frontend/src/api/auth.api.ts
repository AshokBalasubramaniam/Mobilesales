import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { Role, User } from '../types/models';

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Extract<Role, 'buyer' | 'seller'>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  role?: Extract<Role, 'buyer' | 'seller'>;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  register: (payload: RegisterPayload) => axiosClient.post<ApiResponse<AuthSession>>('/auth/register', payload),
  login: (payload: LoginPayload) => axiosClient.post<ApiResponse<AuthSession>>('/auth/login', payload),
  googleLogin: (payload: GoogleLoginPayload) => axiosClient.post<ApiResponse<AuthSession>>('/auth/google', payload),
  requestOtp: (phone: string) => axiosClient.post<ApiResponse<null>>('/auth/otp/request', { phone }),
  verifyOtp: (payload: VerifyOtpPayload) => axiosClient.post<ApiResponse<AuthSession>>('/auth/otp/verify', payload),
  logout: () => axiosClient.post<ApiResponse<null>>('/auth/logout'),
  me: () => axiosClient.get<ApiResponse<User>>('/auth/me'),
  verifyEmail: (token: string) => axiosClient.post<ApiResponse<null>>('/auth/verify-email', { token }),
  resendVerification: () => axiosClient.post<ApiResponse<null>>('/auth/resend-verification'),
  forgotPassword: (email: string) => axiosClient.post<ApiResponse<null>>('/auth/forgot-password', { email }),
  resetPassword: (payload: ResetPasswordPayload) => axiosClient.post<ApiResponse<null>>('/auth/reset-password', payload),
  changePassword: (payload: ChangePasswordPayload) => axiosClient.post<ApiResponse<null>>('/auth/change-password', payload),
};
