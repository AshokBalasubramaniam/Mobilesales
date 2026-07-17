import { useEffect } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../features/notifications/thunks";
import {
  selectNotificationItems,
  selectNotificationsStatus,
  selectUnreadNotificationsCount,
} from "../../features/notifications/selectors";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatRelativeTime } from "../../utils/format";

const classes = {
  header: "mb-4 flex items-center justify-between",
  title: "text-lg font-semibold",
  list: "space-y-2",
  item: "flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-4",
  itemUnread: "bg-brand-50/50",
  itemButton: "flex-1 text-left",
  itemTitle: "font-medium",
  itemMessage: "mt-0.5 text-sm text-gray-500",
  itemTime: "mt-1 text-xs text-gray-400",
  deleteIcon: "size-4 text-gray-400 hover:text-red-500",
};

const Notifications = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotificationItems);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const status = useAppSelector(selectNotificationsStatus);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  if (status === "loading") return <Spinner full />;

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.title}>Notifications</h2>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            icon={CheckCheck}
            onClick={() => dispatch(markAllNotificationsRead())}
          >
            Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Updates about your orders, chats, and listings will appear here."
        />
      ) : (
        <div className={classes.list}>
          {items.map((n) => (
            <div
              key={n._id}
              className={clsx(classes.item, !n.isRead && classes.itemUnread)}
            >
              <button
                className={classes.itemButton}
                onClick={() =>
                  !n.isRead && dispatch(markNotificationRead(n._id))
                }
              >
                <p className={classes.itemTitle}>{n.title}</p>
                <p className={classes.itemMessage}>{n.message}</p>
                <p className={classes.itemTime}>
                  {formatRelativeTime(n.createdAt)}
                </p>
              </button>
              <button onClick={() => dispatch(deleteNotification(n._id))}>
                <Trash2 className={classes.deleteIcon} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
