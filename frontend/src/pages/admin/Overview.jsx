import { useEffect, useState } from 'react';
import { Users, ListChecks, ShoppingBag, Wallet, Clock, Flag } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/format';

const Overview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi.admin().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Platform Overview</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={Users} label="Total Sellers" value={stats.totalSellers} />
        <StatCard icon={ListChecks} label="Total Listings" value={stats.totalListings} />
        <StatCard icon={Clock} label="Pending Approvals" value={stats.pendingApprovals} accent="text-amber-500" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={Wallet} label="Revenue" value={formatCurrency(stats.revenue)} accent="text-green-600" />
        <StatCard icon={Flag} label="Pending Reports" value={stats.fraudReports} accent="text-red-500" />
      </div>
    </div>
  );
};

export default Overview;
