import { LayoutDashboard, Users, ListChecks, Flag, Gavel, ShoppingBag, Ticket, Wallet, BarChart3, MessageCircle } from 'lucide-react';
import DashboardLayout, { type DashboardNavLink } from './DashboardLayout';
import { PATHS } from '../routes/paths';

const links: DashboardNavLink[] = [
  { to: PATHS.admin.overview, label: 'Overview', icon: LayoutDashboard, end: true },
  { to: PATHS.admin.users, label: 'Users', icon: Users },
  { to: PATHS.admin.listings, label: 'Listing Approvals', icon: ListChecks },
  { to: PATHS.admin.chats, label: 'Chats', icon: MessageCircle },
  { to: PATHS.admin.reports, label: 'Reports', icon: Flag },
  { to: PATHS.admin.disputes, label: 'Disputes', icon: Gavel },
  { to: PATHS.admin.orders, label: 'Orders', icon: ShoppingBag },
  { to: PATHS.admin.coupons, label: 'Coupons', icon: Ticket },
  { to: PATHS.admin.revenue, label: 'Revenue', icon: Wallet },
  { to: PATHS.admin.analytics, label: 'Analytics', icon: BarChart3 },
];

const AdminLayout = () => <DashboardLayout title="Admin Panel" links={links} />;

export default AdminLayout;
