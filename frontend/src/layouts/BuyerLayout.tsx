import { Link } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Heart,
  Ticket,
  Bell,
  Star,
  MessageCircle,
  ListChecks,
  PackageCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import DashboardLayout, { type DashboardNavLink } from "./DashboardLayout";
import { PATHS } from "../routes/paths";
import { useAuth } from "../hooks/useAuth";

const links: DashboardNavLink[] = [
  { to: PATHS.buyer.profile, label: "Profile", icon: User },
  { to: PATHS.buyer.orders, label: "Orders", icon: ShoppingBag },
  { to: PATHS.buyer.wishlist, label: "Wishlist", icon: Heart },
  { to: PATHS.buyer.coupons, label: "Coupons", icon: Ticket },
  { to: PATHS.buyer.notifications, label: "Notifications", icon: Bell },
  { to: PATHS.buyer.reviews, label: "My Reviews", icon: Star },
  { to: PATHS.buyer.chats, label: "Chats", icon: MessageCircle },
];

const classes = {
  card: "rounded-md border border-white/10 bg-white/5 px-3.5 py-4",
  icon: "mb-1.5 size-5 text-accent-400",
  title: "font-display text-sm font-extrabold tracking-wide text-brand-400",
  text: "mt-1 mb-3 text-[11px] leading-snug text-brand-200/70",
  button:
    "flex w-full items-center justify-center gap-1 rounded bg-brand-500 py-2 text-xs font-bold tracking-wider text-white uppercase hover:bg-brand-600",
  buttonIcon: "size-3.5",
};

const SellPromo = () => (
  <div className={classes.card}>
    <Zap className={classes.icon} />
    <p className={classes.title}>Sell Your Device</p>
    <p className={classes.text}>
      Turn your old phone or laptop into cash. Fast, easy, secure.
    </p>
    <Link to={PATHS.sell} className={classes.button}>
      Start Selling <ArrowRight className={classes.buttonIcon} />
    </Link>
  </div>
);

// Shown right after Orders, only for sellers (buyers have no listings/sales)
const SELLER_LINKS: DashboardNavLink[] = [
  { to: PATHS.buyer.listings, label: "My Listings", icon: ListChecks },
  { to: PATHS.buyer.sales, label: "My Sales", icon: PackageCheck },
];

const BuyerLayout = () => {
  const { isSeller } = useAuth();
  const navLinks = isSeller
    ? [...links.slice(0, 2), ...SELLER_LINKS, ...links.slice(2)]
    : links;

  return (
    <DashboardLayout
      title="My Account"
      subtitle="Manage your profile, orders, wishlist and more."
      links={navLinks}
      promo={<SellPromo />}
    />
  );
};

export default BuyerLayout;
