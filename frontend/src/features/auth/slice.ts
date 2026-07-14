import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/models';

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  bootstrapped: boolean;
  error: string | null;
  otpPhone: string | null;
}

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

    authRequest: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    bootstrapSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.bootstrapped = true;
    },
    bootstrapFailure: (state) => {
      state.user = null;
      state.bootstrapped = true;
    },

    logoutSuccess: (state) => {
      state.user = null;
    },

    otpRequestSuccess: (state, action: PayloadAction<string>) => {
      state.otpPhone = action.payload;
    },
    otpRequestFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  clearAuthError,
  setUser,
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
} = authSlice.actions;
export default authSlice.reducer;
