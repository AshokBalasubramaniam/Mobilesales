import type { Dispatch } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import api, { refreshAccessToken } from "../../api/api";
import { setAccessToken, clearAccessToken } from "../../api/tokenManager";
import {
  sendFirebasePhoneOtp,
  confirmFirebasePhoneOtp,
  describeFirebaseAuthError,
} from "../../lib/firebasePhoneAuth";
import type { ApiResponse } from "../../types/api";
import type { Role, User } from "../../types/models";
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
} from "./slice";

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Extract<Role, "buyer" | "seller">;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  role?: Extract<Role, "buyer" | "seller">;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export type OtpLoginResult =
  | { status: "logged_in"; user: User }
  | { status: "needs_registration"; idToken: string; phone: string };

export interface CompleteOtpRegistrationPayload {
  idToken: string;
  name: string;
  password: string;
  role?: Extract<Role, "buyer" | "seller">;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

const extractError = (err: unknown): string => {
  if (!isAxiosError<{ message?: string; errors?: string[] }>(err)) {
    return "Something went wrong";
  }
  const data = err.response?.data;
  return data?.errors?.length ? data.errors.join(" ") : (data?.message ?? "Something went wrong");
};

const extractOtpError = (err: unknown): string =>
  isAxiosError(err) ? extractError(err) : describeFirebaseAuthError(err);

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const applySession = (data: AuthSession): User => {
  if (data.accessToken) setAccessToken(data.accessToken);
  return data.user;
};

export const register =
  (payload: RegisterPayload) => async (dispatch: Dispatch) => {
    try {
      dispatch(registerStart());
      const response = await api.post<ApiResponse<AuthSession>>(
        "/auth/register",
        payload,
      );
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
    const response = await api.post<ApiResponse<AuthSession>>(
      "/auth/login",
      payload,
    );
    if (response.status === 200) {
      const user = applySession(response.data.data);
      dispatch(loginSuccess(user));
      return user;
    }
  } catch (error) {
    dispatch(loginFail(extractError(error)));
  }
};

export const googleLogin =
  (payload: GoogleLoginPayload) => async (dispatch: Dispatch) => {
    try {
      dispatch(googleLoginStart());
      const response = await api.post<ApiResponse<AuthSession>>(
        "/auth/google",
        payload,
      );
      if (response.status === 200) {
        const user = applySession(response.data.data);
        dispatch(googleLoginSuccess(user));
        return user;
      }
    } catch (error) {
      dispatch(googleLoginFail(extractError(error)));
    }
  };

// Sends the OTP via Firebase Phone Auth (client-side reCAPTCHA + SMS) rather
// than a custom/mock backend OTP — also covers resend, since calling this
// again for the same number just requests a fresh code.
export const requestOtp = (phone: string) => async (dispatch: Dispatch) => {
  try {
    await sendFirebasePhoneOtp(phone);
    dispatch(otpRequestSuccess(phone));
    return phone;
  } catch (error) {
    dispatch(otpRequestFail(extractOtpError(error)));
  }
};

interface FirebaseLoginResponse {
  requiresRegistration?: boolean;
  phone?: string;
  user?: User;
  accessToken?: string;
}

// Firebase verifies the code and hands back an ID token proving phone
// ownership; the backend trusts that token to create/log in the user, or —
// for a number with no account yet — reports back that registration
// (name + password) is needed before it will create one.
export const verifyOtp =
  (payload: VerifyOtpPayload) =>
  async (dispatch: Dispatch): Promise<OtpLoginResult | undefined> => {
    try {
      dispatch(verifyOtpStart());
      const idToken = await confirmFirebasePhoneOtp(payload.code);
      const response = await api.post<ApiResponse<FirebaseLoginResponse>>(
        "/auth/firebase-login",
        { idToken },
      );
      if (response.status === 200) {
        const { data } = response.data;
        if (data.requiresRegistration) {
          return { status: "needs_registration", idToken, phone: data.phone! };
        }
        const user = applySession(data as AuthSession);
        dispatch(verifyOtpSuccess(user));
        return { status: "logged_in", user };
      }
    } catch (error) {
      dispatch(verifyOtpFail(extractOtpError(error)));
    }
  };

// Completes signup for a number verifyOtp reported as unregistered, reusing
// the same (still-valid) Firebase ID token rather than requiring a fresh OTP.
export const completeOtpRegistration =
  (payload: CompleteOtpRegistrationPayload) => async (dispatch: Dispatch) => {
    try {
      dispatch(verifyOtpStart());
      const response = await api.post<ApiResponse<AuthSession>>(
        "/auth/firebase-login",
        payload,
      );
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
    const response = await api.get<ApiResponse<User>>("/auth/me");
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
    await api.post("/auth/logout");
  } finally {
    clearAccessToken();
    dispatch(logoutSuccess());
  }
};

export const updateProfileThunk =
  (payload: UpdateProfilePayload) => async (dispatch: Dispatch) => {
    try {
      const response = await api.patch<ApiResponse<User>>("/users/me", payload);
      if (response.status === 200) {
        dispatch(updateProfileSuccess(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      dispatch(updateProfileFail(extractError(error)));
    }
  };
