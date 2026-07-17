import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import api from "../../api/api";
import OrderListItem from "../../components/order/OrderListItem";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { ORDER_STATUS_LABELS } from "../../utils/constants";
import type { ApiResponse, PaginationMeta } from "../../types/api";
import type { Order, OrderStatus } from "../../types/models";

const classes = {
  header: "mb-4 flex items-center justify-between",
  title: "text-lg font-semibold",
  statusSelect: "w-40",
  list: "space-y-3",
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<Order[]>>("/orders/my", {
        params: { page, orderStatus: status || undefined },
      })
      .then(({ data }) => {
        setOrders(data.data);
        setMeta(data.meta ?? null);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.title}>My Orders</h2>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className={classes.statusSelect}
        >
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
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Your purchases will show up here."
        />
      ) : (
        <div className={classes.list}>
          {orders.map((order) => (
            <OrderListItem
              key={order._id}
              order={order}
              counterpartLabel="Seller"
            />
          ))}
        </div>
      )}
      <Pagination meta={meta ?? undefined} onPageChange={setPage} />
    </div>
  );
};

export default Orders;
