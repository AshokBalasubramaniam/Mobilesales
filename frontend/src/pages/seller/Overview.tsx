import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShoppingBag,
  Eye,
  Heart,
  ListChecks,
  Clock,
  MessageCircle,
  Plus,
} from "lucide-react";
import api from "../../api/api";
import type { SellerDashboardStats } from "../../types/dashboard";
import StatCard from "../../components/dashboard/StatCard";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatCurrency } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { ApiResponse } from "../../types/api";

const classes = {
  headerRow: "mb-6 flex items-center justify-between",
  title: "text-lg font-semibold",
  statsGrid: "grid grid-cols-2 gap-4 sm:grid-cols-4",
  ordersSection: "mt-8",
  ordersTitle: "mb-3 font-semibold",
  ordersList: "flex flex-wrap gap-3",
  orderStatusChip:
    "rounded-lg border border-gray-200 px-4 py-2 text-sm capitalize dark:border-gray-800",
  emptyMessage: "text-sm text-gray-500",
};

const Overview = () => {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);

  useEffect(() => {
    api
      .get<ApiResponse<SellerDashboardStats>>("/dashboard/seller")
      .then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Spinner full />;

  return (
    <div>
      <div className={classes.headerRow}>
        <h2 className={classes.title}>Overview</h2>
        <Link to={PATHS.sell}>
          <Button icon={Plus}>New Listing</Button>
        </Link>
      </div>

      <div className={classes.statsGrid}>
        <StatCard
          icon={Wallet}
          label="Total Earnings"
          value={formatCurrency(stats.earnings)}
        />
        <StatCard icon={ShoppingBag} label="Sales" value={stats.sales} />
        <StatCard icon={Eye} label="Total Views" value={stats.views} />
        <StatCard icon={Heart} label="Total Likes" value={stats.likes} />
        <StatCard
          icon={ListChecks}
          label="Active Listings"
          value={stats.activeListings}
        />
        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={stats.pendingListings}
        />
        <StatCard
          icon={MessageCircle}
          label="Chat Requests"
          value={stats.chatRequests}
        />
      </div>

      <div className={classes.ordersSection}>
        <h3 className={classes.ordersTitle}>Orders by Status</h3>
        <div className={classes.ordersList}>
          {Object.entries(stats.ordersByStatus).map(([status, count]) => (
            <div key={status} className={classes.orderStatusChip}>
              {status.replace(/_/g, " ")}: <strong>{count}</strong>
            </div>
          ))}
          {Object.keys(stats.ordersByStatus).length === 0 && (
            <p className={classes.emptyMessage}>No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
