import api from '../../api/api';
import type { AppDispatch } from '../../app/store';
import type { ApiResponse } from '../../types/api';
import type { Review } from '../../types/models';
import { homeReviewsRequest, homeReviewsSuccess, homeReviewsFailure } from './slice';

export const fetchHomeReviews = (mobileIds: string[]) => async (dispatch: AppDispatch) => {
  dispatch(homeReviewsRequest());
  try {
    const lists = await Promise.all(
      mobileIds.map((id) =>
        api
          .get<ApiResponse<Review[]>>(`/reviews/mobile/${id}`, { params: { limit: 3 } })
          .then((r) => r.data.data)
          .catch(() => [] as Review[])
      )
    );
    const reviews = lists.flat();
    dispatch(homeReviewsSuccess(reviews));
    return reviews;
  } catch {
    dispatch(homeReviewsFailure());
  }
};
