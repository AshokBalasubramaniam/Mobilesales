import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Mobile } from "../../types/models";

// The wishlist list endpoint always populates `mobile`, unlike the generic Wishlist model type.
export interface WishlistItem {
  _id: string;
  user: string;
  mobile: Mobile;
  createdAt: string;
  updatedAt: string;
}

type WishlistState = {
  items: WishlistItem[];
  ids: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: WishlistState = {
  items: [],
  ids: [],
  status: "idle",
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    wishlistFetchStart: (state) => {
      state.status = "loading";
      state.error = null;
    },
    wishlistFetched: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.ids = action.payload.map((item) => item.mobile._id);
      state.status = "succeeded";
    },
    wishlistFetchFail: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    wishlistItemAdded: (state, action: PayloadAction<string>) => {
      if (!state.ids.includes(action.payload)) state.ids.push(action.payload);
    },
    wishlistItemRemoved: (state, action: PayloadAction<string>) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
      state.items = state.items.filter(
        (item) => item.mobile._id !== action.payload,
      );
    },
  },
});

export const {
  wishlistFetchStart,
  wishlistFetched,
  wishlistFetchFail,
  wishlistItemAdded,
  wishlistItemRemoved,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
