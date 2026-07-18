import type { Dispatch } from "@reduxjs/toolkit";
import api from "../../api/api";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../../types/api";
import type { Notification } from "../../types/models";
import {
  notificationsStart,
  notificationsSuccess,
  notificationsFail,
  notificationMarkedRead,
  allNotificationsMarkedRead,
  notificationDeleted,
} from "./slice";

export interface NotificationsResponse extends ApiResponse<Notification[]> {
  meta: PaginationMeta & { unreadCount: number };
}

export const fetchNotifications =
  (params?: PaginationParams) => async (dispatch: Dispatch) => {
    try {
      dispatch(notificationsStart());
      const response = await api.get<NotificationsResponse>("/notifications", {
        params,
      });
      if (response.status === 200) {
        dispatch(
          notificationsSuccess({
            items: response.data.data,
            unreadCount: response.data.meta.unreadCount,
          }),
        );
        return {
          items: response.data.data,
          unreadCount: response.data.meta.unreadCount,
        };
      }
    } catch {
      dispatch(notificationsFail());
    }
  };

export const markNotificationRead =
  (id: string) => async (dispatch: Dispatch) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      if (response.status === 200) {
        dispatch(notificationMarkedRead(id));
        return id;
      }
    } catch (error) {
      throw error;
    }
  };

export const markAllNotificationsRead = () => async (dispatch: Dispatch) => {
  try {
    const response = await api.patch("/notifications/read-all");
    if (response.status === 200) {
      dispatch(allNotificationsMarkedRead());
    }
  } catch (error) {
    throw error;
  }
};

export const deleteNotification =
  (id: string) => async (dispatch: Dispatch) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.status === 200) {
        dispatch(notificationDeleted(id));
        return id;
      }
    } catch (error) {
      throw error;
    }
  };
