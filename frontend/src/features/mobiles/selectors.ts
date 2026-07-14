import type { RootState } from '../../app/store';

export const selectHomeSections = (state: RootState) => state.mobiles.homeSections;
export const selectHomeSectionsStatus = (state: RootState) => state.mobiles.homeSectionsStatus;
export const selectHomeSectionsError = (state: RootState) => state.mobiles.homeSectionsError;
