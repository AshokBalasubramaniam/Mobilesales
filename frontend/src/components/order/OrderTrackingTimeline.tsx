import {
  Check,
  Package,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { DELIVERY_STATUS_STEPS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";
import type { DeliveryStatus, Order } from "../../types/models";

const ICONS: Record<Exclude<DeliveryStatus, "cancelled">, LucideIcon> = {
  pending: Package,
  packed: PackageCheck,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: Home,
};

export interface OrderTrackingTimelineProps {
  order: Order;
}

const classes = {
  cancelled:
    "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400",
  cancelledIcon: "size-5",
  container: "flex items-start",
  step: "flex flex-1 flex-col items-center text-center last:flex-none",
  stepRow: "flex w-full items-center",
  circleBase: "flex size-9 shrink-0 items-center justify-center rounded-full",
  circleDone: "bg-brand-600 text-white",
  circleNotDone: "bg-gray-200 text-gray-400 dark:bg-gray-800",
  stepIcon: "size-4",
  connectorBase: "h-0.5 flex-1",
  connectorDone: "bg-brand-600",
  connectorNotDone: "bg-gray-200 dark:bg-gray-800",
  label: "mt-2 text-xs font-medium capitalize",
  timestamp: "text-[10px] text-gray-400",
};

const OrderTrackingTimeline = ({ order }: OrderTrackingTimelineProps) => {
  if (order.deliveryStatus === "cancelled") {
    return (
      <div className={classes.cancelled}>
        <XCircle className={classes.cancelledIcon} /> Order cancelled
        {order.cancelReason ? `: ${order.cancelReason}` : ""}
      </div>
    );
  }

  const currentIdx = DELIVERY_STATUS_STEPS.indexOf(order.deliveryStatus);

  return (
    <div className={classes.container}>
      {DELIVERY_STATUS_STEPS.map((step, idx) => {
        const Icon = ICONS[step];
        const done = idx <= currentIdx;
        const event = order.trackingHistory?.find((h) => h.status === step);
        return (
          <div key={step} className={classes.step}>
            <div className={classes.stepRow}>
              <div
                className={clsx(
                  classes.circleBase,
                  done ? classes.circleDone : classes.circleNotDone,
                )}
              >
                {done && idx < currentIdx ? (
                  <Check className={classes.stepIcon} />
                ) : (
                  <Icon className={classes.stepIcon} />
                )}
              </div>
              {idx < DELIVERY_STATUS_STEPS.length - 1 && (
                <div
                  className={clsx(
                    classes.connectorBase,
                    idx < currentIdx
                      ? classes.connectorDone
                      : classes.connectorNotDone,
                  )}
                />
              )}
            </div>
            <span className={classes.label}>{step.replace(/_/g, " ")}</span>
            {event && (
              <span className={classes.timestamp}>
                {formatDateTime(event.timestamp)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTrackingTimeline;
