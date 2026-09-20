import type { RootState } from "../../app/store";

export const selectMobileNavOpen = (state: RootState) => state.ui.mobileNavOpen;
export const selectLoginModalIntent = (state: RootState) =>
  state.ui.loginModalIntent;
