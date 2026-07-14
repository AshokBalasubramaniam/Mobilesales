import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../features/notifications/thunks';
import { selectNotificationItems, selectUnreadNotificationsCount, selectNotificationsStatus } from '../../features/notifications/selectors';
import { formatRelativeTime } from '../../utils/format';

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotificationItems);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const status = useAppSelector(selectNotificationsStatus);

  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (open && status === 'idle') dispatch(fetchNotifications());
  }, [open, status, dispatch]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 p-3 dark:border-gray-800">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No notifications yet</p>}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.isRead && dispatch(markNotificationRead(n._id))}
                className={clsx(
                  'block w-full border-b border-gray-50 p-3 text-left text-sm hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/50',
                  !n.isRead && 'bg-brand-50/60 dark:bg-brand-900/10'
                )}
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>
                <p className="mt-1 text-[11px] text-gray-400">{formatRelativeTime(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
