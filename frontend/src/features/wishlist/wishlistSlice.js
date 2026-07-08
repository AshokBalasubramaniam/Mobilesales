import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '../../api/wishlist.api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await wishlistApi.list(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (mobileId, { rejectWithValue }) => {
  try {
    await wishlistApi.add(mobileId);
    return mobileId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not add to wishlist');
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (mobileId, { rejectWithValue }) => {
  try {
    await wishlistApi.remove(mobileId);
    return mobileId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not remove from wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    ids: [],
    status: 'idle',
  },
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

export const selectIsWishlisted = (mobileId) => (state) => state.wishlist.ids.includes(mobileId);

export default wishlistSlice.reducer;
