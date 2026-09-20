import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Package,
  Clock,
  ShoppingBag,
  Wallet,
  Flag,
  ChevronRight,
} from "lucide-react";
import api from "../../api/api";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import type { BadgeProps } from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/format";
import { DEVICE_CATEGORIES } from "../../utils/constants";
import { PATHS } from "../../routes/paths";
import type { AdminDashboardStats, SalesPoint } from "../../types/dashboard";
import type { Mobile, Order, OrderStatus, User } from "../../types/models";
import type { ApiResponse } from "../../types/api";

const CATEGORY_LABEL = Object.fromEntries(
  DEVICE_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<string, string>;

const ORDER_STATUS_VARIANT: Partial<
  Record<OrderStatus, NonNullable<BadgeProps["variant"]>>
> = {
  completed: "green",
  cancelled: "red",
  disputed: "amber",
  placed: "brand",
  confirmed: "brand",
};

const formatChartDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
        date,
      );
};

const classes = {
  headerRow: "mb-6 flex flex-wrap items-center justify-between gap-3",
  title: "text-2xl font-bold text-gray-900",
  subtitle: "mt-0.5 text-sm text-gray-500",
  dateBadge:
    "rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500",
  statGrid: "mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4",
  statCard:
    "flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
  statIconWrap: "flex size-12 shrink-0 items-center justify-center rounded-xl",
  statLabel: "text-sm text-gray-500",
  statValue: "text-2xl font-bold text-gray-900",
  statCaption: "mt-0.5 text-xs text-gray-400",
  panelsGrid: "mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3",
  panel: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
  panelHeader: "mb-4 flex items-center justify-between",
  panelTitle: "text-sm font-semibold text-gray-900",
  panelHint:
    "flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500",
  promoCard:
    "relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 p-5",
  promoBrand: "mb-2 text-[10px] font-bold tracking-widest text-accent-400",
  promoTitle: "mb-2 text-xl font-bold leading-tight text-white",
  promoText: "mb-4 text-xs leading-relaxed text-brand-100",
  promoButton:
    "flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-accent-400",
  bottomGrid: "grid grid-cols-1 gap-4 lg:grid-cols-3",
  viewAllLink: "text-xs font-medium text-brand-600 hover:underline",
  listRow: "flex items-center gap-3 py-2",
  rowImage: "size-9 rounded-lg bg-gray-100 object-cover",
  rowInfo: "min-w-0 flex-1",
  rowTitle: "truncate text-xs font-medium text-gray-900",
  rowSubtitle: "text-[11px] text-gray-400",
};

interface StatCardConfig {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  caption: string;
}

const StatCard = ({ icon, iconBg, label, value, caption }: StatCardConfig) => (
  <div className={classes.statCard}>
    <div className={`${classes.statIconWrap} ${iconBg}`}>{icon}</div>
    <div className="min-w-0">
      <p className={classes.statLabel}>{label}</p>
      <p className={classes.statValue}>{value}</p>
      <p className={classes.statCaption}>{caption}</p>
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [dailySales, setDailySales] = useState<SalesPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Mobile[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<AdminDashboardStats>>("/dashboard/admin"),
      api.get<ApiResponse<{ dailySales: SalesPoint[] }>>(
        "/admin/analytics/sales",
      ),
      api.get<ApiResponse<Order[]>>("/orders/admin/all", {
        params: { limit: 5 },
      }),
      api.get<ApiResponse<Mobile[]>>("/mobiles", {
        params: { sort: "popular", limit: 5 },
      }),
      api.get<ApiResponse<User[]>>("/users", { params: { limit: 5 } }),
    ]).then(([statsRes, salesRes, ordersRes, productsRes, usersRes]) => {
      setStats(statsRes.data.data);
      setDailySales(salesRes.data.data.dailySales.slice(-7));
      setRecentOrders(ordersRes.data.data);
      setTopProducts(productsRes.data.data);
      setRecentUsers(usersRes.data.data);
    });
  }, []);

  if (!stats) return <Spinner full />;

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div>
      <div className={classes.headerRow}>
        <div>
          <h1 className={classes.title}>Platform Overview</h1>
          <p className={classes.subtitle}>
            Here's what's happening with your marketplace today.
          </p>
        </div>
        <span className={classes.dateBadge}>
          {formatDate(monthStart)} – {formatDate(today)}
        </span>
      </div>

      <div className={classes.statGrid}>
        <StatCard
          icon={<Users className="size-5 text-green-600" />}
          iconBg="bg-green-50"
          label="Total Users"
          value={stats.totalUsers}
          caption="All registered users"
        />
        <StatCard
          icon={<Users className="size-5 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Total Sellers"
          value={stats.totalSellers}
          caption="Verified & pending"
        />
        <StatCard
          icon={<Package className="size-5 text-purple-600" />}
          iconBg="bg-purple-50"
          label="Total Listings"
          value={stats.totalListings}
          caption="Across all statuses"
        />
        <StatCard
          icon={<Clock className="size-5 text-amber-600" />}
          iconBg="bg-amber-50"
          label="Pending Approvals"
          value={stats.pendingApprovals}
          caption="Awaiting review"
        />
        <StatCard
          icon={<ShoppingBag className="size-5 text-red-500" />}
          iconBg="bg-red-50"
          label="Total Orders"
          value={stats.totalOrders}
          caption="All time"
        />
        <StatCard
          icon={<Wallet className="size-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          caption="Captured payments"
        />
        <StatCard
          icon={<Flag className="size-5 text-teal-600" />}
          iconBg="bg-teal-50"
          label="Pending Reports"
          value={stats.fraudReports}
          caption="Needs moderation"
        />
      </div>

      <div className={classes.panelsGrid}>
        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <h3 className={classes.panelTitle}>Sales Overview</h3>
            <span className={classes.panelHint}>
              Last 7 days <ChevronRight className="size-3" />
            </span>
          </div>
          {dailySales.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart
                data={dailySales}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="_id"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(label) => formatChartDate(String(label ?? ""))}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                  dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <h3 className={classes.panelTitle}>Total Revenue</h3>
            <span className={classes.panelHint}>
              Last 7 days <ChevronRight className="size-3" />
            </span>
          </div>
          {dailySales.length === 0 ? (
            <EmptyState title="No revenue yet" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={dailySales}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="_id"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(label) => formatChartDate(String(label ?? ""))}
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="totalSales"
                  name="Revenue"
                  fill="#86efac"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={classes.promoCard}>
          <div className={classes.promoBrand}>MAPZHA</div>
          <h3 className={classes.promoTitle}>
            Powering a<br />
            Smarter Tomorrow
          </h3>
          <p className={classes.promoText}>
            Buy, sell &amp; exchange electronics
            <br />
            with a trusted community.
          </p>
          <Link to={PATHS.search} className={classes.promoButton}>
            View Store <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      <div className={classes.bottomGrid}>
        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <h3 className={classes.panelTitle}>Recent Orders</h3>
            <Link to={PATHS.admin.orders} className={classes.viewAllLink}>
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Orders will appear here once customers start buying."
            />
          ) : (
            recentOrders.map((order) => {
              const mobile =
                typeof order.mobile === "string" ? null : order.mobile;
              const buyer =
                typeof order.buyer === "string" ? null : order.buyer;
              return (
                <div key={order._id} className={classes.listRow}>
                  <img
                    src={mobile?.images?.[0]?.url}
                    alt=""
                    className={classes.rowImage}
                  />
                  <div className={classes.rowInfo}>
                    <p className={classes.rowTitle}>
                      {mobile?.brand} {mobile?.model}
                    </p>
                    <p className={classes.rowSubtitle}>{buyer?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      {formatCurrency(order.pricing.totalAmount)}
                    </p>
                    <Badge
                      variant={ORDER_STATUS_VARIANT[order.orderStatus] || "gray"}
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <h3 className={classes.panelTitle}>Top Products</h3>
            <Link to={PATHS.admin.products} className={classes.viewAllLink}>
              View All
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <EmptyState icon={Package} title="No active listings yet" />
          ) : (
            topProducts.map((mobile) => (
              <div key={mobile._id} className={classes.listRow}>
                <img
                  src={mobile.images?.[0]?.url}
                  alt=""
                  className={classes.rowImage}
                />
                <div className={classes.rowInfo}>
                  <p className={classes.rowTitle}>
                    {mobile.brand} {mobile.model}
                  </p>
                  <p className={classes.rowSubtitle}>
                    {CATEGORY_LABEL[mobile.category] || mobile.category}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {mobile.views} views
                </span>
              </div>
            ))
          )}
        </div>

        <div className={classes.panel}>
          <div className={classes.panelHeader}>
            <h3 className={classes.panelTitle}>Recent Users</h3>
            <Link to={PATHS.admin.users} className={classes.viewAllLink}>
              View All
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <EmptyState icon={Users} title="No users yet" />
          ) : (
            recentUsers.map((user) => (
              <div key={user._id} className={classes.listRow}>
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div className={classes.rowInfo}>
                  <p className={classes.rowTitle}>{user.name}</p>
                  <p className={classes.rowSubtitle}>
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <Badge variant={user.role === "buyer" ? "brand" : "green"}>
                  {user.role}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
