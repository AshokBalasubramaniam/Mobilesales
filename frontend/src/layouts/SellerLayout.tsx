import { LayoutDashboard, ListChecks, ShoppingBag, Wallet, ShieldCheck, MessageCircle } from 'lucide-react';
import DashboardLayout, { type DashboardNavLink } from './DashboardLayout';
import { PATHS } from '../routes/paths';

const links: DashboardNavLink[] = [
  { to: PATHS.seller.overview, label: 'Overview', icon: LayoutDashboard, end: true },
  { to: PATHS.seller.listings, label: 'My Listings', icon: ListChecks },
  { to: PATHS.seller.orders, label: 'Orders', icon: ShoppingBag },
  { to: PATHS.seller.earnings, label: 'Earnings', icon: Wallet },
  { to: PATHS.seller.verification, label: 'Verification', icon: ShieldCheck },
  { to: PATHS.seller.chats, label: 'Chat Requests', icon: MessageCircle },
];

const SellerLayout = () => <DashboardLayout title="Seller Dashboard" links={links} />;

export default SellerLayout;
