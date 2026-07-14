import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Review } from '../../types/models';

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
  reducers: {
    homeReviewsRequest: (state) => {
      state.homeReviewsStatus = 'loading';
    },
    homeReviewsSuccess: (state, action: PayloadAction<Review[]>) => {
      state.homeReviewsStatus = 'succeeded';
      state.homeReviews = action.payload;
    },
    homeReviewsFailure: (state) => {
      state.homeReviewsStatus = 'failed';
    },
  },
});

export const { homeReviewsRequest, homeReviewsSuccess, homeReviewsFailure } = reviewsSlice.actions;
export default reviewsSlice.reducer;
