import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { wishlistApi } from '../../api/wishlist.api';
import type { PaginationParams } from '../../types/api';
import type { Mobile } from '../../types/models';

const extractError = (err: unknown, fallback: string): string =>
  isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? fallback : fallback;

// The wishlist list endpoint always populates `mobile`, unlike the generic Wishlist model type.
export interface WishlistItem {
  _id: string;
  user: string;
  mobile: Mobile;
  createdAt: string;
  updatedAt: string;
}

export const fetchWishlist = createAsyncThunk<WishlistItem[], PaginationParams | undefined, { rejectValue: string }>(
  'wishlist/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await wishlistApi.list(params);
      return data.data as unknown as WishlistItem[];
    } catch (err) {
      return rejectWithValue(extractError(err, 'Could not load wishlist'));
    }
  }
);

export const addToWishlist = createAsyncThunk<string, string, { rejectValue: string }>('wishlist/add', async (mobileId, { rejectWithValue }) => {
  try {
    await wishlistApi.add(mobileId);
    return mobileId;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Could not add to wishlist'));
  }
});

export const removeFromWishlist = createAsyncThunk<string, string, { rejectValue: string }>(
  'wishlist/remove',
  async (mobileId, { rejectWithValue }) => {
    try {
      await wishlistApi.remove(mobileId);
      return mobileId;
    } catch (err) {
      return rejectWithValue(extractError(err, 'Could not remove from wishlist'));
    }
  }
);

export interface WishlistState {
  items: WishlistItem[];
  ids: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: WishlistState = {
  items: [],
  ids: [],
  status: 'idle',
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.ids = action.payload.map((item) => item.mobile._id);
        state.status = 'succeeded';
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.ids.includes(action.payload)) state.ids.push(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
        state.items = state.items.filter((item) => item.mobile._id !== action.payload);
      });
  },
});

export default wishlistSlice.reducer;
