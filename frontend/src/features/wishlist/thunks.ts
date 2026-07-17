import type { Dispatch } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import api from "../../api/api";
import type { ApiResponse, PaginationParams } from "../../types/api";
import {
  wishlistFetchStart,
  wishlistFetched,
  wishlistFetchFail,
  wishlistItemAdded,
  wishlistItemRemoved,
  type WishlistItem,
} from "./slice";

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? "Something went wrong")
    : "Something went wrong";

export const fetchWishlist =
  (params?: PaginationParams) => async (dispatch: Dispatch) => {
    try {
      dispatch(wishlistFetchStart());
      const response = await api.get<ApiResponse<WishlistItem[]>>("/wishlist", {
        params,
      });
      if (response.status === 200) {
        dispatch(wishlistFetched(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      dispatch(wishlistFetchFail(extractError(error)));
    }
  };

export const addToWishlist =
  (mobileId: string) => async (dispatch: Dispatch) => {
    try {
      const response = await api.post("/wishlist", { mobileId });
      if (response.status === 201) {
        dispatch(wishlistItemAdded(mobileId));
        return mobileId;
      }
    } catch (error) {
      throw error;
    }
  };

export const removeFromWishlist =
  (mobileId: string) => async (dispatch: Dispatch) => {
    try {
      const response = await api.delete(`/wishlist/${mobileId}`);
      if (response.status === 200) {
        dispatch(wishlistItemRemoved(mobileId));
        return mobileId;
      }
    } catch (error) {
      throw error;
    }
  };
