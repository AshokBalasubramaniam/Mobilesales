import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { PATHS } from '../../routes/paths';

const STATUS_VARIANT = { completed: 'green', cancelled: 'red', disputed: 'amber', placed: 'brand', confirmed: 'brand' };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .listAll({ page, orderStatus: status || undefined })
      .then(({ data }) => {
        setOrders(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Orders</h2>
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
        <EmptyState icon={ShoppingBag} title="No orders" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-900">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="p-3">
                    <Link to={PATHS.orderDetail(o._id)} className="font-medium hover:text-brand-600">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {o.mobile?.brand} {o.mobile?.model}
                    </p>
                  </td>
                  <td className="p-3">{o.buyer?.name}</td>
                  <td className="p-3">{o.seller?.name}</td>
                  <td className="p-3 font-medium">{formatCurrency(o.pricing?.totalAmount)}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[o.orderStatus] || 'gray'}>{ORDER_STATUS_LABELS[o.orderStatus]}</Badge>
                  </td>
                  <td className="p-3 text-gray-500">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Orders;
