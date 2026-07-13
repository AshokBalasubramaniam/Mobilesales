import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { notificationsApi } from '../../api/notifications.api';
import type { PaginationParams } from '../../types/api';
import type { Notification } from '../../types/models';

export const fetchNotifications = createAsyncThunk<{ items: Notification[]; unreadCount: number }, PaginationParams | undefined>(
  'notifications/fetch',
  async (params) => {
    const { data } = await notificationsApi.list(params);
    return { items: data.data, unreadCount: data.meta.unreadCount };
  }
);

export const markNotificationRead = createAsyncThunk<string, string>('notifications/markRead', async (id) => {
  await notificationsApi.markAsRead(id);
  return id;
});

export const markAllNotificationsRead = createAsyncThunk<void, void>('notifications/markAllRead', async () => {
  await notificationsApi.markAllAsRead();
});

export const deleteNotification = createAsyncThunk<string, string>('notifications/delete', async (id) => {
  await notificationsApi.remove(id);
  return id;
});

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  status: 'idle',
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<Notification>) => {
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
