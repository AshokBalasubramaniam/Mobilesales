import type { RootState } from "../../app/store";

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectMobileNavOpen = (state: RootState) => state.ui.mobileNavOpen;
