import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../api/notifications.api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await notificationsApi.list(params);
    return { items: data.data, unreadCount: data.meta.unreadCount };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id) => {
  await notificationsApi.markAsRead(id);
  return id;
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await notificationsApi.markAllAsRead();
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id) => {
  await notificationsApi.remove(id);
  return id;
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    status: 'idle',
  },
  reducers: {
    notificationReceived: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
        state.status = 'succeeded';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.items.find((n) => n._id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      });
  },
});

export const { notificationReceived } = notificationsSlice.actions;
export default notificationsSlice.reducer;
