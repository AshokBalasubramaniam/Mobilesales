import api from '../../api/api';
import type { AppDispatch } from '../../app/store';
import type { ApiResponse, PaginationParams } from '../../types/api';
import { wishlistFetched, wishlistItemAdded, wishlistItemRemoved, type WishlistItem } from './slice';

export const fetchWishlist = (params?: PaginationParams) => async (dispatch: AppDispatch) => {
  try {
    const { data } = await api.get<ApiResponse<WishlistItem[]>>('/wishlist', { params });
    dispatch(wishlistFetched(data.data));
    return data.data;
  } catch {
    // no-op on failure, matching prior behavior.
  }
};

export const addToWishlist = (mobileId: string) => async (dispatch: AppDispatch) => {
  try {
    await api.post('/wishlist', { mobileId });
    dispatch(wishlistItemAdded(mobileId));
    return mobileId;
  } catch {
    // no-op on failure, matching prior behavior.
  }
};

export const removeFromWishlist = (mobileId: string) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/wishlist/${mobileId}`);
    dispatch(wishlistItemRemoved(mobileId));
    return mobileId;
  } catch {
    // no-op on failure, matching prior behavior.
  }
};
