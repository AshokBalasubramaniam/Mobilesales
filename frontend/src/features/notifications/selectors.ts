import type { RootState } from '../../app/store';

export const selectNotificationItems = (state: RootState) => state.notifications.items;
export const selectUnreadNotificationsCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state: RootState) => state.notifications.status;
