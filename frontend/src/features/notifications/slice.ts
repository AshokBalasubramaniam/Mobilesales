import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Notification } from "../../types/models";

export interface NotificationsFetchedPayload {
  items: Notification[];
  unreadCount: number;
}

type NotificationsState = {
  items: Notification[];
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  status: "idle",
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },

    notificationsStart: (state) => {
      state.status = "loading";
    },
    notificationsSuccess: (
      state,
      action: PayloadAction<NotificationsFetchedPayload>,
    ) => {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
      state.status = "succeeded";
    },
    notificationsFail: (state) => {
      state.status = "failed";
    },
    notificationMarkedRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    allNotificationsMarkedRead: (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    notificationDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n._id !== action.payload);
    },
  },
});

export const {
  notificationReceived,
  notificationsStart,
  notificationsSuccess,
  notificationsFail,
  notificationMarkedRead,
  allNotificationsMarkedRead,
  notificationDeleted,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
