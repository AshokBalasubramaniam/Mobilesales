import { useEffect, useState } from 'react';
import { Wallet, ShoppingBag } from 'lucide-react';
import api from '../../api/api';
import type { SellerDashboardStats } from '../../types/dashboard';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';
import type { ApiResponse } from '../../types/api';
import type { Payment } from '../../types/models';

// The /payments/my endpoint populates `order` with { orderNumber, pricing, orderStatus }
// (backend/src/controllers/payment.controller.js getMyPayments), but the shared Payment
// model types `order` as a plain string id. Narrow locally rather than widening the shared type.
interface PopulatedPaymentOrder {
  orderNumber?: string;
}

const Earnings = () => {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<ApiResponse<SellerDashboardStats>>('/dashboard/seller'), api.get<ApiResponse<Payment[]>>('/payments/my')])
      .then(([statsRes, paymentsRes]) => {
        setStats(statsRes.data.data);
        setPayments(paymentsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Earnings</h2>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <StatCard icon={Wallet} label="Total Earnings" value={formatCurrency(stats.earnings)} />
        <StatCard icon={ShoppingBag} label="Completed Sales" value={stats.sales} />
      </div>

      <h3 className="mb-3 font-semibold">Payment History</h3>
      {payments.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet" />
      ) : (
        <div className="space-y-2">
          {payments.map((p) => {
            const order = p.order as unknown as PopulatedPaymentOrder | undefined;
            return (
              <div key={p._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
                <div>
                  <p className="font-medium">{order?.orderNumber}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(p.amount)}</p>
                  <Badge variant={p.status === 'captured' ? 'green' : p.status === 'refunded' ? 'amber' : 'gray'}>{p.status}</Badge>
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
