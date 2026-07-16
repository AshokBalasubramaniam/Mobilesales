import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Review } from '../../types/models';

type ReviewsState = {
  homeReviews: Review[];
  homeReviewsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: ReviewsState = {
  homeReviews: [],
  homeReviewsStatus: 'idle',
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    homeReviewsStart: (state) => {
      state.homeReviewsStatus = 'loading';
    },
    homeReviewsSuccess: (state, action: PayloadAction<Review[]>) => {
      state.homeReviewsStatus = 'succeeded';
      state.homeReviews = action.payload;
    },
    homeReviewsFail: (state) => {
      state.homeReviewsStatus = 'failed';
    },
  },
});

export const { homeReviewsStart, homeReviewsSuccess, homeReviewsFail } = reviewsSlice.actions;
export default reviewsSlice.reducer;
