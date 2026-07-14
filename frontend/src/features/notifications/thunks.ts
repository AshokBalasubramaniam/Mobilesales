import api from '../../api/api';
import type { AppDispatch } from '../../app/store';
import type { ApiResponse, PaginationMeta, PaginationParams } from '../../types/api';
import type { Notification } from '../../types/models';
import {
  notificationsRequest,
  notificationsSuccess,
  notificationsFailure,
  notificationMarkedRead,
  allNotificationsMarkedRead,
  notificationDeleted,
} from './slice';

export interface NotificationsResponse extends ApiResponse<Notification[]> {
  meta: PaginationMeta & { unreadCount: number };
}

export const fetchNotifications = (params?: PaginationParams) => async (dispatch: AppDispatch) => {
  dispatch(notificationsRequest());
  try {
    const { data } = await api.get<NotificationsResponse>('/notifications', { params });
    dispatch(notificationsSuccess({ items: data.data, unreadCount: data.meta.unreadCount }));
    return { items: data.data, unreadCount: data.meta.unreadCount };
  } catch {
    dispatch(notificationsFailure());
  }
};

export const markNotificationRead = (id: string) => async (dispatch: AppDispatch) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    dispatch(notificationMarkedRead(id));
    return id;
  } catch {
    // no-op on failure, matching prior behavior.
  }
};

export const markAllNotificationsRead = () => async (dispatch: AppDispatch) => {
  try {
    await api.patch('/notifications/read-all');
    dispatch(allNotificationsMarkedRead());
  } catch {
    // no-op on failure, matching prior behavior.
  }
};

export const deleteNotification = (id: string) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/notifications/${id}`);
    dispatch(notificationDeleted(id));
    return id;
  } catch {
    // no-op on failure, matching prior behavior.
  }
};
