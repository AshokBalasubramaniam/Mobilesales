import type { Dispatch } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import type { Review } from "../../types/models";
import { homeReviewsStart, homeReviewsSuccess, homeReviewsFail } from "./slice";

export const fetchHomeReviews =
  (mobileIds: string[]) => async (dispatch: Dispatch) => {
    try {
      dispatch(homeReviewsStart());
      const lists = await Promise.all(
        mobileIds.map((id) =>
          api
            .get<ApiResponse<Review[]>>(`/reviews/mobile/${id}`, {
              params: { limit: 3 },
            })
            .then((response) =>
              response.status === 200 ? response.data.data : [],
            )
            .catch(() => [] as Review[]),
        ),
      );
      const reviews = lists.flat();
      dispatch(homeReviewsSuccess(reviews));
      return reviews;
    } catch {
      dispatch(homeReviewsFail());
    }
  };
