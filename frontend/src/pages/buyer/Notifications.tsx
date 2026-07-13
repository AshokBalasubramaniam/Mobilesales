import { useEffect } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../features/notifications/notificationsSlice';
import { selectNotificationItems, selectNotificationsStatus, selectUnreadNotificationsCount } from '../../selectors/notifications.selectors';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatRelativeTime } from '../../utils/format';

const Notifications = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotificationItems);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const status = useAppSelector(selectNotificationsStatus);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  if (status === 'loading') return <Spinner full />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" icon={CheckCheck} onClick={() => dispatch(markAllNotificationsRead())}>
            Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Updates about your orders, chats, and listings will appear here." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n._id}
              className={clsx(
                'flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800',
                !n.isRead && 'bg-brand-50/50 dark:bg-brand-900/10'
              )}
            >
              <button className="flex-1 text-left" onClick={() => !n.isRead && dispatch(markNotificationRead(n._id))}>
                <p className="font-medium">{n.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</p>
              </button>
              <button onClick={() => dispatch(deleteNotification(n._id))}>
                <Trash2 className="size-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
