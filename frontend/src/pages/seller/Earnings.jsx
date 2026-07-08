import { useEffect, useState } from 'react';
import { Wallet, ShoppingBag } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import { paymentsApi } from '../../api/payments.api';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

const Earnings = () => {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.seller(), paymentsApi.myPayments()])
      .then(([statsRes, paymentsRes]) => {
        setStats(statsRes.data.data);
        setPayments(paymentsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

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
          {payments.map((p) => (
            <div key={p._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
              <div>
                <p className="font-medium">{p.order?.orderNumber}</p>
                <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(p.amount)}</p>
                <Badge variant={p.status === 'captured' ? 'green' : p.status === 'refunded' ? 'amber' : 'gray'}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Earnings;
