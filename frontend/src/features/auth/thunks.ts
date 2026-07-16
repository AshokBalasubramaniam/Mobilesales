import type { Dispatch } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import api, { refreshAccessToken } from '../../api/api';
import { setAccessToken, clearAccessToken } from '../../api/tokenManager';
import type { ApiResponse } from '../../types/api';
import type { Role, User } from '../../types/models';
import {
  registerStart,
  registerSuccess,
  registerFail,
  loginStart,
  loginSuccess,
  loginFail,
  googleLoginStart,
  googleLoginSuccess,
  googleLoginFail,
  otpRequestSuccess,
  otpRequestFail,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFail,
  bootstrapSuccess,
  bootstrapFail,
  logoutSuccess,
  updateProfileSuccess,
  updateProfileFail,
} from './slice';

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

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'Something went wrong' : 'Something went wrong';

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const applySession = (data: AuthSession): User => {
  if (data.accessToken) setAccessToken(data.accessToken);
  return data.user;
};

export const register = (payload: RegisterPayload) => async (dispatch: Dispatch) => {
  try {
    dispatch(registerStart());
    const response = await api.post<ApiResponse<AuthSession>>('/auth/register', payload);
    if (response.status === 201) {
      const user = applySession(response.data.data);
      dispatch(registerSuccess(user));
      return user;
    }
  } catch (error) {
    dispatch(registerFail(extractError(error)));
  }
};

export const login = (payload: LoginPayload) => async (dispatch: Dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post<ApiResponse<AuthSession>>('/auth/login', payload);
    if (response.status === 200) {
      const user = applySession(response.data.data);
      dispatch(loginSuccess(user));
      return user;
    }
  } catch (error) {
    dispatch(loginFail(extractError(error)));
  }
};

export const googleLogin = (payload: GoogleLoginPayload) => async (dispatch: Dispatch) => {
  try {
    dispatch(googleLoginStart());
    const response = await api.post<ApiResponse<AuthSession>>('/auth/google', payload);
    if (response.status === 200) {
      const user = applySession(response.data.data);
      dispatch(googleLoginSuccess(user));
      return user;
    }
  } catch (error) {
    dispatch(googleLoginFail(extractError(error)));
  }
};

export const requestOtp = (phone: string) => async (dispatch: Dispatch) => {
  try {
    const response = await api.post<ApiResponse<null>>('/auth/otp/request', { phone });
    if (response.status === 200) {
      dispatch(otpRequestSuccess(phone));
      return phone;
    }
  } catch (error) {
    dispatch(otpRequestFail(extractError(error)));
  }
};

export const verifyOtp = (payload: VerifyOtpPayload) => async (dispatch: Dispatch) => {
  try {
    dispatch(verifyOtpStart());
    const response = await api.post<ApiResponse<AuthSession>>('/auth/otp/verify', payload);
    if (response.status === 200) {
      const user = applySession(response.data.data);
      dispatch(verifyOtpSuccess(user));
      return user;
    }
  } catch (error) {
    dispatch(verifyOtpFail(extractError(error)));
  }
};

// Restores the session on page load. Uses the same deduped refreshAccessToken
// used by the response interceptor, so a concurrent 401-triggered refresh
// elsewhere in the app can never race this one (refresh tokens rotate on
// use, so two concurrent calls would make one another fail). Also tolerates
// a single transient failure (cold-start backend, brief network blip)
// before concluding the user is actually logged out — without this, a
// one-off hiccup on page load flashes the login screen for a session that
// is otherwise perfectly valid.
export const bootstrapAuth = () => async (dispatch: Dispatch) => {
  const attempt = async (): Promise<User | undefined> => {
    await refreshAccessToken();
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (response.status === 200) return response.data.data;
  };

  try {
    const user = await attempt();
    dispatch(bootstrapSuccess(user ?? null));
    return user;
  } catch {
    await wait(800);
    try {
      const user = await attempt();
      dispatch(bootstrapSuccess(user ?? null));
      return user;
    } catch {
      clearAccessToken();
      dispatch(bootstrapFail());
    }
  }
};

export const logout = () => async (dispatch: Dispatch) => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAccessToken();
    dispatch(logoutSuccess());
  }
};

export const updateProfileThunk = (payload: UpdateProfilePayload) => async (dispatch: Dispatch) => {
  try {
    const response = await api.patch<ApiResponse<User>>('/users/me', payload);
    if (response.status === 200) {
      dispatch(updateProfileSuccess(response.data.data));
      return response.data.data;
    }
  } catch (error) {
    dispatch(updateProfileFail(extractError(error)));
  }
};
