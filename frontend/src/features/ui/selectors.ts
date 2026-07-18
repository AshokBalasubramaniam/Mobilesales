import type { RootState } from "../../app/store";

export const selectMobileNavOpen = (state: RootState) => state.ui.mobileNavOpen;
