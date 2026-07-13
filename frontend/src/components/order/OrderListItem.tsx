import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import type { BadgeProps } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { PATHS } from '../../routes/paths';
import type { Order, OrderStatus } from '../../types/models';

const STATUS_VARIANT: Record<OrderStatus, NonNullable<BadgeProps['variant']>> = {
  completed: 'green',
  cancelled: 'red',
  disputed: 'amber',
  placed: 'brand',
  confirmed: 'brand',
};

export interface OrderListItemProps {
  order: Order;
  counterpartLabel: string;
}

const OrderListItem = ({ order, counterpartLabel }: OrderListItemProps) => {
  const mobile = typeof order.mobile === 'object' ? order.mobile : undefined;
  const buyer = typeof order.buyer === 'object' ? order.buyer : undefined;
  const seller = typeof order.seller === 'object' ? order.seller : undefined;

  return (
    <Link
      to={PATHS.orderDetail(order._id)}
      className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-brand-300 dark:border-gray-800"
    >
      <img src={mobile?.images?.[0]?.url} alt="" className="size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {mobile?.brand} {mobile?.model}
        </p>
        <p className="text-xs text-gray-500">
          {counterpartLabel}: {buyer?.name || seller?.name} · {formatDate(order.createdAt)}
        </p>
        <p className="mt-1 text-xs text-gray-400">#{order.orderNumber}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatCurrency(order.pricing?.totalAmount)}</p>
        <Badge variant={STATUS_VARIANT[order.orderStatus] || 'gray'} className="mt-1">
          {ORDER_STATUS_LABELS[order.orderStatus]}
        </Badge>
      </div>
    </Link>
  );
};

export default OrderListItem;
