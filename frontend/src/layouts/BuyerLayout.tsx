import {
  User,
  ShoppingBag,
  Heart,
  Ticket,
  Bell,
  Star,
  MessageCircle,
} from "lucide-react";
import DashboardLayout, { type DashboardNavLink } from "./DashboardLayout";
import { PATHS } from "../routes/paths";

const links: DashboardNavLink[] = [
  { to: PATHS.buyer.profile, label: "Profile", icon: User },
  { to: PATHS.buyer.orders, label: "Orders", icon: ShoppingBag },
  { to: PATHS.buyer.wishlist, label: "Wishlist", icon: Heart },
  { to: PATHS.buyer.coupons, label: "Coupons", icon: Ticket },
  { to: PATHS.buyer.notifications, label: "Notifications", icon: Bell },
  { to: PATHS.buyer.reviews, label: "My Reviews", icon: Star },
  { to: PATHS.buyer.chats, label: "Chats", icon: MessageCircle },
];

const BuyerLayout = () => <DashboardLayout title="My Account" links={links} />;

export default BuyerLayout;
