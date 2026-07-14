import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import api from '../../api/api';
import type { RevenueStats } from '../../types/dashboard';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/format';
import type { ApiResponse } from '../../types/api';

const Revenue = () => {
  const [data, setData] = useState<RevenueStats | null>(null);

  useEffect(() => {
    api.get<ApiResponse<RevenueStats>>('/admin/revenue').then(({ data }) => setData(data.data));
  }, []);

  if (!data) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Revenue Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={formatCurrency(data.totalRevenue)} accent="text-green-600" />
        <StatCard icon={TrendingDown} label="Total Refunded" value={formatCurrency(data.totalRefunded)} accent="text-red-500" />
        <StatCard icon={Wallet} label="Net Revenue" value={formatCurrency(data.netRevenue)} />
        <StatCard icon={Clock} label="Pending Payments" value={data.pendingPayments} accent="text-amber-500" />
      </div>
    </div>
  );
};

export default Revenue;
