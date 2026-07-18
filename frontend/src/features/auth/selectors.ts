import type { RootState } from "../../app/store";

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.user);
export const selectBootstrapped = (state: RootState) => state.auth.bootstrapped;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
