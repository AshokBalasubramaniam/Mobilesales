import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Package,
  ListChecks,
  Flag,
  Gavel,
  ShoppingBag,
  Ticket,
  Wallet,
  BarChart3,
  MessageCircle,
  Settings as SettingsIcon,
  Search,
  LogOut,
  Crown,
  ArrowRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import api from "../api/api";
import { useAppDispatch } from "../app/hooks";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../features/auth/thunks";
import Avatar from "../components/common/Avatar";
import NotificationsMenu from "../components/layout/NotificationsMenu";
import UserMenu from "../components/layout/UserMenu";
import { PATHS } from "../routes/paths";
import type { ApiResponse } from "../types/api";

interface NavLinkConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_LINKS: NavLinkConfig[] = [
  { to: PATHS.admin.overview, label: "Overview", icon: LayoutDashboard, end: true },
  { to: PATHS.admin.users, label: "Users", icon: Users },
  { to: PATHS.admin.products, label: "Products", icon: Package },
  { to: PATHS.admin.listings, label: "Listing Approvals", icon: ListChecks },
  { to: PATHS.admin.chats, label: "Chats", icon: MessageCircle },
  { to: PATHS.admin.reports, label: "Reports", icon: Flag },
  { to: PATHS.admin.disputes, label: "Disputes", icon: Gavel },
  { to: PATHS.admin.orders, label: "Orders", icon: ShoppingBag },
  { to: PATHS.admin.coupons, label: "Coupons", icon: Ticket },
  { to: PATHS.admin.revenue, label: "Revenue", icon: Wallet },
  { to: PATHS.admin.analytics, label: "Analytics", icon: BarChart3 },
  { to: PATHS.admin.settings, label: "Settings", icon: SettingsIcon },
];

const classes = {
  shell: "flex h-screen overflow-hidden bg-gray-50",
  backdrop: "fixed inset-0 z-40 bg-black/40 lg:hidden",
  sidebar:
    "fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col bg-brand-900 transition-transform duration-200 lg:static lg:z-auto lg:w-52 lg:translate-x-0",
  sidebarOpen: "translate-x-0",
  sidebarCloseButton: "ml-auto rounded-lg p-1 text-gray-400 hover:text-white lg:hidden",
  logoRow: "flex items-center gap-2.5 border-b border-white/5 px-4 py-4",
  logoMark:
    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white",
  logoName: "text-sm leading-tight font-bold text-white",
  logoTagline: "text-[8px] font-semibold tracking-wider text-accent-400",
  panelLabel: "px-4 pt-3 pb-1",
  panelLabelText:
    "text-[10px] font-semibold tracking-wider text-gray-500 uppercase",
  nav: "flex-1 overflow-y-auto px-2 py-1",
  navLink:
    "mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
  navLinkActive: "bg-brand-600 font-medium text-white",
  navLinkInactive: "text-gray-400 hover:bg-white/5 hover:text-white",
  navIcon: "size-4",
  navLabel: "flex-1 text-left",
  navBadge:
    "flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white",
  promo: "mx-2 mb-2 rounded-2xl border border-brand-700 bg-brand-800/60 p-3.5",
  promoHeader: "mb-1.5 flex items-center gap-2",
  promoTitle: "text-[11px] font-semibold text-white",
  promoText: "mb-2.5 text-[10px] leading-relaxed text-gray-400",
  promoButton:
    "ml-auto flex size-7 items-center justify-center rounded-full bg-brand-500 hover:bg-brand-400",
  sidebarUser:
    "flex items-center gap-2.5 border-t border-white/5 px-3 py-3",
  sidebarUserInfo: "min-w-0 flex-1",
  sidebarUserName: "truncate text-[11px] font-medium text-white",
  sidebarUserRole: "truncate text-[9px] text-gray-500 capitalize",
  logoutButton: "shrink-0 text-gray-500 hover:text-white",

  main: "flex flex-1 flex-col overflow-hidden",
  header:
    "flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:gap-4 sm:px-6",
  menuButton:
    "flex size-8 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100 lg:hidden",
  searchForm: "relative flex-1",
  searchIcon:
    "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400",
  searchInput:
    "w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-4 text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30",
  headerActions: "flex items-center gap-2",
  iconButton:
    "flex size-8 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100",
  userLabel: "hidden text-right sm:block",
  userLabelName: "text-xs leading-tight font-semibold text-gray-800",
  userLabelRole: "text-[10px] text-gray-400 capitalize",

  content: "flex-1 overflow-y-auto p-4 sm:p-6",
  contentFullBleed: "flex-1 overflow-y-auto p-3 sm:p-4 lg:flex",
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api
      .get<ApiResponse<unknown[]>>("/mobiles/admin/pending", {
        params: { limit: 1 },
      })
      .then(({ data }) => setPendingCount(data.meta?.total || 0));
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(
      query
        ? `${PATHS.admin.products}?q=${encodeURIComponent(query)}`
        : PATHS.admin.products,
    );
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(PATHS.home);
  };

  const isChats = location.pathname.startsWith(PATHS.admin.chats);

  return (
    <div className={classes.shell}>
      {mobileNavOpen && (
        <div
          className={classes.backdrop}
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={clsx(classes.sidebar, mobileNavOpen && classes.sidebarOpen)}
      >
        <div className={classes.logoRow}>
          <span className={classes.logoMark}>M</span>
          <div>
            <div className={classes.logoName}>MAPZHA</div>
            <div className={classes.logoTagline}>ELECTRONICS MARKETPLACE</div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className={classes.sidebarCloseButton}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className={classes.panelLabel}>
          <span className={classes.panelLabelText}>Admin Panel</span>
        </div>

        <nav className={classes.nav}>
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  classes.navLink,
                  isActive ? classes.navLinkActive : classes.navLinkInactive,
                )
              }
            >
              <Icon className={classes.navIcon} />
              <span className={classes.navLabel}>{label}</span>
              {label === "Listing Approvals" && pendingCount > 0 && (
                <span className={classes.navBadge}>
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={classes.promo}>
          <div className={classes.promoHeader}>
            <Crown className="size-3.5 text-accent-400" />
            <span className={classes.promoTitle}>Grow Your Marketplace</span>
          </div>
          <p className={classes.promoText}>
            More Devices. More Sellers.
            <br />
            More Happy Customers.
          </p>
          <button
            onClick={() => navigate(PATHS.search)}
            className={classes.promoButton}
            aria-label="Explore marketplace"
          >
            <ArrowRight className="size-3 text-white" />
          </button>
        </div>

        <div className={classes.sidebarUser}>
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
          <div className={classes.sidebarUserInfo}>
            <p className={classes.sidebarUserName}>{user?.name}</p>
            <p className={classes.sidebarUserRole}>{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className={classes.logoutButton}
            aria-label="Logout"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </aside>

      <div className={classes.main}>
        <header className={classes.header}>
          <button
            onClick={() => setMobileNavOpen(true)}
            className={classes.menuButton}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <form onSubmit={handleSearch} className={classes.searchForm}>
            <Search className={`${classes.searchIcon} size-3.5`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, users, orders..."
              className={classes.searchInput}
            />
          </form>
          <div className={classes.headerActions}>
            <NotificationsMenu />
            <button
              onClick={() => navigate(PATHS.admin.chats)}
              className={classes.iconButton}
              aria-label="Chats"
            >
              <MessageCircle className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className={classes.userLabel}>
                <span className={`${classes.userLabelName} block`}>
                  {user?.name}
                </span>
                <span className={`${classes.userLabelRole} block`}>
                  {user?.role}
                </span>
              </span>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className={isChats ? classes.contentFullBleed : classes.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
