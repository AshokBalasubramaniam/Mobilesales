import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import OrderListItem from '../../components/order/OrderListItem';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .myOrdersAsBuyer({ page, orderStatus: status || undefined })
      .then(({ data }) => {
        setOrders(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Orders</h2>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
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
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Your purchases will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderListItem key={order._id} order={order} counterpartLabel="Seller" />
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Orders;
