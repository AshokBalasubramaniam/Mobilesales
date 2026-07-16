import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Mobile } from '../../types/models';

export interface HomeSections {
  verified: Mobile[];
  premium: Mobile[];
  recentlyAdded: Mobile[];
  bestDeals: Mobile[];
  popularBrands: { brand: string; count: number }[];
}

type MobilesState = {
  homeSections: HomeSections | null;
  homeSectionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  homeSectionsError: string | null;
};

const initialState: MobilesState = {
  homeSections: null,
  homeSectionsStatus: 'idle',
  homeSectionsError: null,
};

const mobilesSlice = createSlice({
  name: 'mobiles',
  initialState,
  reducers: {
    homeSectionsStart: (state) => {
      state.homeSectionsStatus = 'loading';
      state.homeSectionsError = null;
    },
    homeSectionsSuccess: (state, action: PayloadAction<HomeSections>) => {
      state.homeSectionsStatus = 'succeeded';
      state.homeSections = action.payload;
    },
    homeSectionsFail: (state, action: PayloadAction<string>) => {
      state.homeSectionsStatus = 'failed';
      state.homeSectionsError = action.payload;
    },
  },
});

export const { homeSectionsStart, homeSectionsSuccess, homeSectionsFail } = mobilesSlice.actions;
export default mobilesSlice.reducer;
