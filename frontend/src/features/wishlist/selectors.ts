import type { RootState } from '../../app/store';

export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistIds = (state: RootState) => state.wishlist.ids;
export const selectWishlistStatus = (state: RootState) => state.wishlist.status;
export const selectWishlistError = (state: RootState) => state.wishlist.error;
export const selectIsWishlisted = (mobileId: string) => (state: RootState) => state.wishlist.ids.includes(mobileId);
