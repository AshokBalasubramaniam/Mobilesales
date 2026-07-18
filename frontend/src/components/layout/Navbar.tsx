import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Search,
  Menu,
  Smartphone,
  X,
} from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import { useAuth } from "../../hooks/useAuth";
import { selectChatUnreadTotal } from "../../features/chat/selectors";
import { PATHS } from "../../routes/paths";
import Button from "../common/Button";
import NotificationsMenu from "./NotificationsMenu";
import UserMenu from "./UserMenu";

const classes = {
  header:
    "sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur",
  bar: "mx-auto flex max-w-7xl items-center gap-3 px-4 py-3",
  logo: "flex shrink-0 items-center gap-1.5 text-lg font-bold text-brand-600",
  logoIcon: "size-6",
  logoLabel: "hidden sm:inline",
  desktopSearchForm: "relative hidden flex-1 md:block",
  searchIcon: "absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400",
  desktopSearchInput:
    "w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white",
  actions: "ml-auto flex items-center gap-1.5",
  iconButton: "rounded-full p-2 hover:bg-gray-100",
  actionIcon: "size-5",
  chatButton: "relative rounded-full p-2 hover:bg-gray-100",
  chatBadge:
    "absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white",
  sellButton: "hidden sm:inline-flex",
  mobileToggleButton: "rounded-full p-2 hover:bg-gray-100 md:hidden",
  mobilePanel: "border-t border-gray-100 p-3 md:hidden",
  mobileSearchForm: "relative mb-3",
  mobileSearchInput:
    "w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none",
  mobileSellButton: "w-full",
};

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isSeller } = useAuth();
  const chatUnread = useAppSelector(selectChatUnreadTotal);
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(
      query ? `${PATHS.search}?q=${encodeURIComponent(query)}` : PATHS.search,
    );
    setMobileOpen(false);
  };

  return (
    <header className={classes.header}>
      <div className={classes.bar}>
        <Link to={PATHS.home} className={classes.logo}>
          <Smartphone className={classes.logoIcon} />
          <span className={classes.logoLabel}>Mobile Sales</span>
        </Link>

        <form onSubmit={handleSearch} className={classes.desktopSearchForm}>
          <Search className={classes.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand, model..."
            className={classes.desktopSearchInput}
          />
        </form>

        <div className={classes.actions}>
          {isAuthenticated ? (
            <>
              <Link
                to={PATHS.wishlist}
                className={classes.iconButton}
                aria-label="Wishlist"
              >
                <Heart className={classes.actionIcon} />
              </Link>
              <Link
                to={PATHS.chat}
                className={classes.chatButton}
                aria-label="Chat"
              >
                <MessageCircle className={classes.actionIcon} />
                {chatUnread > 0 && (
                  <span className={classes.chatBadge}>
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                )}
              </Link>
              <NotificationsMenu />
              {isSeller && (
                <Button
                  size="sm"
                  onClick={() => navigate(PATHS.sell)}
                  className={classes.sellButton}
                >
                  Sell Your Phone
                </Button>
              )}
              <UserMenu />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(PATHS.login)}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(PATHS.register)}
                className={classes.sellButton}
              >
                Sign Up
              </Button>
            </>
          )}

          <button
            className={classes.mobileToggleButton}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className={classes.actionIcon} />
            ) : (
              <Menu className={classes.actionIcon} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={classes.mobilePanel}>
          <form onSubmit={handleSearch} className={classes.mobileSearchForm}>
            <Search className={classes.searchIcon} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brand, model..."
              className={classes.mobileSearchInput}
            />
          </form>
          {isSeller && (
            <Button
              className={classes.mobileSellButton}
              onClick={() => {
                navigate(PATHS.sell);
                setMobileOpen(false);
              }}
            >
              Sell Your Phone
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
