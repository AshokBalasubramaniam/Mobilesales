import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import type { BadgeProps } from "../common/Badge";
import { formatCurrency, formatDate } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../utils/constants";
import { PATHS } from "../../routes/paths";
import type { Order, OrderStatus } from "../../types/models";

const STATUS_VARIANT: Record<
  OrderStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  completed: "green",
  cancelled: "red",
  disputed: "amber",
  placed: "brand",
  confirmed: "brand",
};

export interface OrderListItemProps {
  order: Order;
  counterpartLabel: string;
}

const classes = {
  container:
    "flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-brand-300 dark:border-gray-800",
  thumbnail: "size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800",
  details: "min-w-0 flex-1",
  title: "truncate font-semibold",
  meta: "text-xs text-gray-500",
  orderNumber: "mt-1 text-xs text-gray-400",
  priceWrap: "text-right",
  price: "font-bold",
  statusBadge: "mt-1",
};

const OrderListItem = ({ order, counterpartLabel }: OrderListItemProps) => {
  const mobile = typeof order.mobile === "object" ? order.mobile : undefined;
  const buyer = typeof order.buyer === "object" ? order.buyer : undefined;
  const seller = typeof order.seller === "object" ? order.seller : undefined;

  return (
    <Link to={PATHS.orderDetail(order._id)} className={classes.container}>
      <img
        src={mobile?.images?.[0]?.url}
        alt=""
        className={classes.thumbnail}
      />
      <div className={classes.details}>
        <p className={classes.title}>
          {mobile?.brand} {mobile?.model}
        </p>
        <p className={classes.meta}>
          {counterpartLabel}: {buyer?.name || seller?.name} ·{" "}
          {formatDate(order.createdAt)}
        </p>
        <p className={classes.orderNumber}>#{order.orderNumber}</p>
      </div>
      <div className={classes.priceWrap}>
        <p className={classes.price}>
          {formatCurrency(order.pricing?.totalAmount)}
        </p>
        <Badge
          variant={STATUS_VARIANT[order.orderStatus] || "gray"}
          className={classes.statusBadge}
        >
          {ORDER_STATUS_LABELS[order.orderStatus]}
        </Badge>
      </div>
    </Link>
  );
};

export default OrderListItem;
