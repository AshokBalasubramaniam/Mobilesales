import type { RootState } from '../../app/store';

export const selectHomeReviews = (state: RootState) => state.reviews.homeReviews;
export const selectHomeReviewsStatus = (state: RootState) => state.reviews.homeReviewsStatus;
