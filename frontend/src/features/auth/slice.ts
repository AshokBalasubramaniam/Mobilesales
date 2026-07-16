import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/models';

type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type AuthState = {
  user: User | null;
  status: AuthStatus;
  bootstrapped: boolean;
  error: string | null;
  otpPhone: string | null;
};

const initialState: AuthState = {
  user: null,
  status: 'idle',
  bootstrapped: false,
  error: null,
  otpPhone: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },

    registerStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
    },
    registerFail: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    loginStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
    },
    loginFail: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    googleLoginStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    googleLoginSuccess: (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
    },
    googleLoginFail: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    otpRequestSuccess: (state, action: PayloadAction<string>) => {
      state.otpPhone = action.payload;
    },
    otpRequestFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    verifyOtpStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    verifyOtpSuccess: (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
    },
    verifyOtpFail: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    bootstrapSuccess: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.bootstrapped = true;
    },
    bootstrapFail: (state) => {
      state.user = null;
      state.bootstrapped = true;
    },

    logoutSuccess: (state) => {
      state.user = null;
    },

    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateProfileFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  clearAuthError,
  setUser,
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
} = authSlice.actions;
export default authSlice.reducer;
