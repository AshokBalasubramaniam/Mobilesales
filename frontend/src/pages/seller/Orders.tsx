import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import api from '../../api/api';
import OrderListItem from '../../components/order/OrderListItem';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import type { ApiResponse, PaginationMeta } from '../../types/api';
import type { Order, OrderStatus } from '../../types/models';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<Order[]>>('/orders/selling', { params: { page, orderStatus: status || undefined } })
      .then(({ data }) => {
        setOrders(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders Received</h2>
        <Select value={status} onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }} className="w-40">
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner full />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders from buyers will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderListItem key={order._id} order={order} counterpartLabel="Buyer" />
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Orders;
