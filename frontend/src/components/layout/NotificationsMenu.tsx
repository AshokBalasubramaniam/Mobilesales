import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../features/notifications/thunks";
import {
  selectNotificationItems,
  selectUnreadNotificationsCount,
  selectNotificationsStatus,
} from "../../features/notifications/selectors";
import { formatRelativeTime } from "../../utils/format";

const classes = {
  container: "relative",
  trigger: "relative rounded-full p-2 hover:bg-gray-100",
  triggerIcon: "size-5",
  badge:
    "absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white",
  panel:
    "absolute right-0 z-40 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg",
  panelHeader: "flex items-center justify-between border-b border-gray-100 p-3",
  panelTitle: "text-sm font-semibold",
  markAllButton:
    "flex items-center gap-1 text-xs text-brand-600 hover:underline",
  markAllIcon: "size-3.5",
  list: "max-h-96 overflow-y-auto",
  emptyMessage: "p-4 text-center text-sm text-gray-500",
  itemBase:
    "block w-full border-b border-gray-50 p-3 text-left text-sm hover:bg-gray-50",
  itemUnread: "bg-brand-50/60",
  itemTitle: "font-medium text-gray-900",
  itemMessage: "mt-0.5 line-clamp-2 text-xs text-gray-500",
  itemTime: "mt-1 text-[11px] text-gray-400",
};

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotificationItems);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const status = useAppSelector(selectNotificationsStatus);

  useEffect(() => {
    const onClick = (e: MouseEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open && status === "idle") dispatch(fetchNotifications());
  }, [open, status, dispatch]);

  return (
    <div className={classes.container} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={classes.trigger}
        aria-label="Notifications"
      >
        <Bell className={classes.triggerIcon} />
        {unreadCount > 0 && (
          <span className={classes.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <span className={classes.panelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className={classes.markAllButton}
              >
                <CheckCheck className={classes.markAllIcon} /> Mark all read
              </button>
            )}
          </div>
          <div className={classes.list}>
            {items.length === 0 && (
              <p className={classes.emptyMessage}>No notifications yet</p>
            )}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() =>
                  !n.isRead && dispatch(markNotificationRead(n._id))
                }
                className={clsx(
                  classes.itemBase,
                  !n.isRead && classes.itemUnread,
                )}
              >
                <p className={classes.itemTitle}>{n.title}</p>
                <p className={classes.itemMessage}>{n.message}</p>
                <p className={classes.itemTime}>
                  {formatRelativeTime(n.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
