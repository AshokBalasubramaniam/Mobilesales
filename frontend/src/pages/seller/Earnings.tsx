import { useEffect, useState } from "react";
import { Wallet, ShoppingBag } from "lucide-react";
import api from "../../api/api";
import type { SellerDashboardStats } from "../../types/dashboard";
import StatCard from "../../components/dashboard/StatCard";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import { formatCurrency, formatDate } from "../../utils/format";
import type { ApiResponse } from "../../types/api";
import type { Payment } from "../../types/models";

interface PopulatedPaymentOrder {
  orderNumber?: string;
}

const classes = {
  title: "mb-4 text-lg font-semibold",
  statsGrid: "mb-6 grid grid-cols-2 gap-4",
  historyTitle: "mb-3 font-semibold",
  historyList: "space-y-2",
  paymentRow:
    "flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800",
  orderNumber: "font-medium",
  paymentDate: "text-xs text-gray-400",
  amountWrapper: "text-right",
  amount: "font-semibold",
};

const Earnings = () => {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<SellerDashboardStats>>("/dashboard/seller"),
      api.get<ApiResponse<Payment[]>>("/payments/my"),
    ])
      .then(([statsRes, paymentsRes]) => {
        setStats(statsRes.data.data);
        setPayments(paymentsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Spinner full />;

  return (
    <div>
      <h2 className={classes.title}>Earnings</h2>
      <div className={classes.statsGrid}>
        <StatCard
          icon={Wallet}
          label="Total Earnings"
          value={formatCurrency(stats.earnings)}
        />
        <StatCard
          icon={ShoppingBag}
          label="Completed Sales"
          value={stats.sales}
        />
      </div>

      <h3 className={classes.historyTitle}>Payment History</h3>
      {payments.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet" />
      ) : (
        <div className={classes.historyList}>
          {payments.map((p) => {
            const order = p.order as unknown as
              | PopulatedPaymentOrder
              | undefined;
            return (
              <div key={p._id} className={classes.paymentRow}>
                <div>
                  <p className={classes.orderNumber}>{order?.orderNumber}</p>
                  <p className={classes.paymentDate}>
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className={classes.amountWrapper}>
                  <p className={classes.amount}>{formatCurrency(p.amount)}</p>
                  <Badge
                    variant={
                      p.status === "captured"
                        ? "green"
                        : p.status === "refunded"
                          ? "amber"
                          : "gray"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Earnings;
