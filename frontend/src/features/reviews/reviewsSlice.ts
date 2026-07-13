import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsApi } from '../../api/reviews.api';
import type { Review } from '../../types/models';

export const fetchHomeReviews = createAsyncThunk<Review[], string[]>('reviews/fetchHomeReviews', async (mobileIds) => {
  const lists = await Promise.all(
    mobileIds.map((id) =>
      reviewsApi
        .byMobile(id, { limit: 3 })
        .then((r) => r.data.data)
        .catch(() => [] as Review[])
    )
  );
  return lists.flat();
});

export interface ReviewsState {
  homeReviews: Review[];
  homeReviewsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ReviewsState = {
  homeReviews: [],
  homeReviewsStatus: 'idle',
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeReviews.pending, (state) => {
        state.homeReviewsStatus = 'loading';
      })
      .addCase(fetchHomeReviews.fulfilled, (state, action) => {
        state.homeReviewsStatus = 'succeeded';
        state.homeReviews = action.payload;
      })
      .addCase(fetchHomeReviews.rejected, (state) => {
        state.homeReviewsStatus = 'failed';
      });
  },
});

export default reviewsSlice.reducer;
