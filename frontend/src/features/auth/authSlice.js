import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth.api';
import { usersApi } from '../../api/users.api';
import { refreshAccessToken } from '../../api/axiosClient';
import { setAccessToken, clearAccessToken } from '../../api/tokenManager';

const extractError = (err) => err.response?.data?.message || 'Something went wrong';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const applySession = (data) => {
  if (data.accessToken) setAccessToken(data.accessToken);
  return data.user;
};

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload);
    return applySession(data.data);
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(payload);
    return applySession(data.data);
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.googleLogin(payload);
    return applySession(data.data);
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const requestOtp = createAsyncThunk('auth/requestOtp', async (phone, { rejectWithValue }) => {
  try {
    await authApi.requestOtp(phone);
    return phone;
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.verifyOtp(payload);
    return applySession(data.data);
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

// Restores the session on page load. Uses the same deduped refreshAccessToken
// used by the response interceptor, so a concurrent 401-triggered refresh
// elsewhere in the app can never race this one (refresh tokens rotate on
// use, so two concurrent calls would make one another fail). Also tolerates
// a single transient failure (cold-start backend, brief network blip)
// before concluding the user is actually logged out — without this, a
// one-off hiccup on page load flashes the login screen for a session that
// is otherwise perfectly valid.
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  const attempt = async () => {
    await refreshAccessToken();
    const meRes = await authApi.me();
    return meRes.data.data;
  };

  try {
    return await attempt();
  } catch (firstErr) {
    await wait(800);
    try {
      return await attempt();
    } catch (secondErr) {
      clearAccessToken();
      return rejectWithValue(null);
    }
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    clearAccessToken();
  }
});

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await usersApi.updateProfile(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle', // idle | loading | succeeded | failed
    bootstrapped: false,
    error: null,
    otpPhone: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.bootstrapped = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.otpPhone = action.payload;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    [register, login, googleLogin, verifyOtp].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });
    });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
