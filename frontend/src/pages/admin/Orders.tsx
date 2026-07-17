import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import api from "../../api/api";
import Badge from "../../components/common/Badge";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { formatCurrency, formatDate } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../utils/constants";
import { PATHS } from "../../routes/paths";
import type { Order, OrderStatus } from "../../types/models";
import type { ApiResponse, PaginationMeta } from "../../types/api";
import type { BadgeProps } from "../../components/common/Badge";

const STATUS_VARIANT: Partial<
  Record<OrderStatus, NonNullable<BadgeProps["variant"]>>
> = {
  completed: "green",
  cancelled: "red",
  disputed: "amber",
  placed: "brand",
  confirmed: "brand",
};

const classes = {
  header: "mb-4 flex items-center justify-between",
  title: "text-lg font-semibold",
  statusSelect: "w-40",
  tableWrapper:
    "overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800",
  table: "w-full min-w-[700px] text-sm",
  thead:
    "bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-900",
  th: "p-3",
  tbody: "divide-y divide-gray-100 dark:divide-gray-800",
  td: "p-3",
  orderLink: "font-medium hover:text-brand-600",
  mobileText: "text-xs text-gray-400",
  amountCell: "p-3 font-medium",
  dateCell: "p-3 text-gray-500",
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<Order[]>>("/orders/admin/all", {
        params: { page, orderStatus: status || undefined },
      })
      .then(({ data }) => {
        setOrders(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.title}>All Orders</h2>
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
        <EmptyState icon={ShoppingBag} title="No orders" />
      ) : (
        <div className={classes.tableWrapper}>
          <table className={classes.table}>
            <thead className={classes.thead}>
              <tr>
                <th className={classes.th}>Order</th>
                <th className={classes.th}>Buyer</th>
                <th className={classes.th}>Seller</th>
                <th className={classes.th}>Amount</th>
                <th className={classes.th}>Status</th>
                <th className={classes.th}>Date</th>
              </tr>
            </thead>
            <tbody className={classes.tbody}>
              {orders.map((o) => {
                const mobile = typeof o.mobile === "string" ? null : o.mobile;
                const buyer = typeof o.buyer === "string" ? null : o.buyer;
                const seller = typeof o.seller === "string" ? null : o.seller;
                return (
                  <tr key={o._id}>
                    <td className={classes.td}>
                      <Link
                        to={PATHS.orderDetail(o._id)}
                        className={classes.orderLink}
                      >
                        {o.orderNumber}
                      </Link>
                      <p className={classes.mobileText}>
                        {mobile?.brand} {mobile?.model}
                      </p>
                    </td>
                    <td className={classes.td}>{buyer?.name}</td>
                    <td className={classes.td}>{seller?.name}</td>
                    <td className={classes.amountCell}>
                      {formatCurrency(o.pricing?.totalAmount)}
                    </td>
                    <td className={classes.td}>
                      <Badge variant={STATUS_VARIANT[o.orderStatus] || "gray"}>
                        {ORDER_STATUS_LABELS[o.orderStatus]}
                      </Badge>
                    </td>
                    <td className={classes.dateCell}>
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Orders;
