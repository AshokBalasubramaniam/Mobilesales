import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "../../types/models";

export interface LoginModalIntent {
  /** Where to land after a successful login/registration, e.g. PATHS.sell. */
  targetPath?: string;
  /** Role to register as when the number has no account yet. */
  role?: Extract<Role, "buyer" | "seller">;
  /** Which form to open on: mobile OTP (default), email login, signup, or
   * forgot password. */
  mode?: "phone" | "email" | "signup" | "forgot";
}

type UiState = {
  mobileNavOpen: boolean;
  loginModalIntent: LoginModalIntent | null;
};

const initialState: UiState = {
  mobileNavOpen: false,
  loginModalIntent: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileNavOpen = action.payload;
    },
    openLoginModal: (state, action: PayloadAction<LoginModalIntent | undefined>) => {
      state.loginModalIntent = action.payload || {};
    },
    closeLoginModal: (state) => {
      state.loginModalIntent = null;
    },
  },
});

export const { setMobileNavOpen, openLoginModal, closeLoginModal } = uiSlice.actions;
export default uiSlice.reducer;
