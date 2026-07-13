import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { mobilesApi, type HomeSections } from '../../api/mobiles.api';

const extractError = (err: unknown, fallback: string): string =>
  isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? fallback : fallback;

export const fetchHomeSections = createAsyncThunk<HomeSections, void, { rejectValue: string }>(
  'mobiles/fetchHomeSections',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await mobilesApi.homeSections();
      return data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Could not load listings'));
    }
  }
);

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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeSections.pending, (state) => {
        state.homeSectionsStatus = 'loading';
        state.homeSectionsError = null;
      })
      .addCase(fetchHomeSections.fulfilled, (state, action) => {
        state.homeSectionsStatus = 'succeeded';
        state.homeSections = action.payload;
      })
      .addCase(fetchHomeSections.rejected, (state, action) => {
        state.homeSectionsStatus = 'failed';
        state.homeSectionsError = action.payload ?? 'Could not load listings';
      });
  },
});

export default mobilesSlice.reducer;
