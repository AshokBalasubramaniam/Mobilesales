import { isAxiosError } from 'axios';
import api, { refreshAccessToken } from '../../api/api';
import { setAccessToken, clearAccessToken } from '../../api/tokenManager';
import type { AppDispatch } from '../../app/store';
import type { ApiResponse } from '../../types/api';
import type { Role, User } from '../../types/models';
import {
  authRequest,
  authSuccess,
  authFailure,
  bootstrapSuccess,
  bootstrapFailure,
  logoutSuccess,
  otpRequestSuccess,
  otpRequestFailure,
  updateProfileSuccess,
  updateProfileFailure,
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

export const register = (payload: RegisterPayload) => async (dispatch: AppDispatch) => {
  dispatch(authRequest());
  try {
    const { data } = await api.post<ApiResponse<AuthSession>>('/auth/register', payload);
    const user = applySession(data.data);
    dispatch(authSuccess(user));
    return user;
  } catch (error) {
    dispatch(authFailure(extractError(error)));
  }
};

export const login = (payload: LoginPayload) => async (dispatch: AppDispatch) => {
  dispatch(authRequest());
  try {
    const { data } = await api.post<ApiResponse<AuthSession>>('/auth/login', payload);
    const user = applySession(data.data);
    dispatch(authSuccess(user));
    return user;
  } catch (error) {
    dispatch(authFailure(extractError(error)));
  }
};

export const googleLogin = (payload: GoogleLoginPayload) => async (dispatch: AppDispatch) => {
  dispatch(authRequest());
  try {
    const { data } = await api.post<ApiResponse<AuthSession>>('/auth/google', payload);
    const user = applySession(data.data);
    dispatch(authSuccess(user));
    return user;
  } catch (error) {
    dispatch(authFailure(extractError(error)));
  }
};

export const requestOtp = (phone: string) => async (dispatch: AppDispatch) => {
  try {
    await api.post<ApiResponse<null>>('/auth/otp/request', { phone });
    dispatch(otpRequestSuccess(phone));
    return phone;
  } catch (error) {
    dispatch(otpRequestFailure(extractError(error)));
  }
};

export const verifyOtp = (payload: VerifyOtpPayload) => async (dispatch: AppDispatch) => {
  dispatch(authRequest());
  try {
    const { data } = await api.post<ApiResponse<AuthSession>>('/auth/otp/verify', payload);
    const user = applySession(data.data);
    dispatch(authSuccess(user));
    return user;
  } catch (error) {
    dispatch(authFailure(extractError(error)));
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
export const bootstrapAuth = () => async (dispatch: AppDispatch) => {
  const attempt = async () => {
    await refreshAccessToken();
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  };

  try {
    const user = await attempt();
    dispatch(bootstrapSuccess(user));
    return user;
  } catch {
    await wait(800);
    try {
      const user = await attempt();
      dispatch(bootstrapSuccess(user));
      return user;
    } catch {
      clearAccessToken();
      dispatch(bootstrapFailure());
    }
  }
};

export const logout = () => async (dispatch: AppDispatch) => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAccessToken();
    dispatch(logoutSuccess());
  }
};

export const updateProfileThunk = (payload: UpdateProfilePayload) => async (dispatch: AppDispatch) => {
  try {
    const { data } = await api.patch<ApiResponse<User>>('/users/me', payload);
    dispatch(updateProfileSuccess(data.data));
    return data.data;
  } catch (error) {
    dispatch(updateProfileFailure(extractError(error)));
  }
};
