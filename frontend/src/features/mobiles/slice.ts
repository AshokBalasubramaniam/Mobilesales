import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Mobile } from '../../types/models';

export interface HomeSections {
  verified: Mobile[];
  premium: Mobile[];
  recentlyAdded: Mobile[];
  bestDeals: Mobile[];
  popularBrands: { brand: string; count: number }[];
}

export interface MobilesState {
  homeSections: HomeSections | null;
  homeSectionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  homeSectionsError: string | null;
}

const initialState: MobilesState = {
  homeSections: null,
  homeSectionsStatus: 'idle',
  homeSectionsError: null,
};

const mobilesSlice = createSlice({
  name: 'mobiles',
  initialState,
  reducers: {
    homeSectionsRequest: (state) => {
      state.homeSectionsStatus = 'loading';
      state.homeSectionsError = null;
    },
    homeSectionsSuccess: (state, action: PayloadAction<HomeSections>) => {
      state.homeSectionsStatus = 'succeeded';
      state.homeSections = action.payload;
    },
    homeSectionsFailure: (state, action: PayloadAction<string>) => {
      state.homeSectionsStatus = 'failed';
      state.homeSectionsError = action.payload;
    },
  },
});

export const { homeSectionsRequest, homeSectionsSuccess, homeSectionsFailure } = mobilesSlice.actions;
export default mobilesSlice.reducer;
