import axiosClient from './axiosClient';
import type { ApiResponse, PaginationMeta, PaginationParams } from '../types/api';
import type { Notification } from '../types/models';

export interface NotificationsResponse extends ApiResponse<Notification[]> {
  meta: PaginationMeta & { unreadCount: number };
}

export const notificationsApi = {
  list: (params?: PaginationParams) => axiosClient.get<NotificationsResponse>('/notifications', { params }),
  markAsRead: (id: string) => axiosClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.patch<ApiResponse<null>>('/notifications/read-all'),
  remove: (id: string) => axiosClient.delete<ApiResponse<null>>(`/notifications/${id}`),
};
