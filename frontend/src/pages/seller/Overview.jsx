import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShoppingBag, Eye, Heart, ListChecks, Clock, MessageCircle, Plus } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/format';
import { PATHS } from '../../routes/paths';

const Overview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi.seller().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Spinner full />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Overview</h2>
        <Link to={PATHS.sell}>
          <Button icon={Plus}>New Listing</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Wallet} label="Total Earnings" value={formatCurrency(stats.earnings)} />
        <StatCard icon={ShoppingBag} label="Sales" value={stats.sales} />
        <StatCard icon={Eye} label="Total Views" value={stats.views} />
        <StatCard icon={Heart} label="Total Likes" value={stats.likes} />
        <StatCard icon={ListChecks} label="Active Listings" value={stats.activeListings} />
        <StatCard icon={Clock} label="Pending Approval" value={stats.pendingListings} />
        <StatCard icon={MessageCircle} label="Chat Requests" value={stats.chatRequests} />
      </div>

      <div className="mt-8">
        <h3 className="mb-3 font-semibold">Orders by Status</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.ordersByStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-gray-200 px-4 py-2 text-sm capitalize dark:border-gray-800">
              {status.replace(/_/g, ' ')}: <strong>{count}</strong>
            </div>
          ))}
          {Object.keys(stats.ordersByStatus).length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Overview;
