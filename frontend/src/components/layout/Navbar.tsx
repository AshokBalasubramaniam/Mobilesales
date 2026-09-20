import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Search, Menu, X } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../hooks/useAuth";
import { selectChatUnreadTotal } from "../../features/chat/selectors";
import { selectLoginModalIntent } from "../../features/ui/selectors";
import { openLoginModal, closeLoginModal, type LoginModalIntent } from "../../features/ui/slice";
import { PATHS } from "../../routes/paths";
import Button from "../common/Button";
import LoginModal from "../auth/LoginModal";
import NotificationsMenu from "./NotificationsMenu";
import UserMenu from "./UserMenu";

const NAV_LINKS = [
  { label: "Buy", to: PATHS.search },
  { label: "Sell", to: PATHS.sell },
  { label: "Exchange", to: PATHS.search },
  { label: "Track Order", to: PATHS.buyer.orders },
  { label: "Support", to: "/contact" },
];

// Buy/Sell require login first when logged out — everything else (browsing
// Exchange, Track Order, Support) stays open.
const NAV_LOGIN_INTENTS: Record<string, LoginModalIntent> = {
  Buy: { targetPath: PATHS.search, role: "buyer" },
  Sell: { targetPath: PATHS.sell, role: "seller" },
};

const classes = {
  header: "sticky top-0 z-30 bg-brand-900 text-white",
  bar: "mx-auto flex max-w-screen-2xl items-center gap-4 px-4 py-3 lg:px-6",
  logo: "flex shrink-0 items-center gap-2.5",
  logoMark:
    "flex size-9 items-center justify-center rounded-lg bg-white text-base font-extrabold text-brand-900",
  logoText: "hidden leading-tight sm:block",
  logoName: "font-display block text-lg font-extrabold tracking-tight text-white",
  logoTagline: "block text-[10px] font-semibold tracking-wide text-accent-400",
  desktopSearchForm: "relative hidden max-w-md flex-1 md:block",
  searchIcon: "absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400",
  desktopSearchInput:
    "w-full rounded-full border border-white/10 bg-white py-2.5 pr-11 pl-10 text-sm text-gray-900 outline-none focus:border-brand-400",
  desktopSearchButton:
    "absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900 text-white",
  desktopSearchButtonIcon: "size-3.5",
  navLinks:
    "hidden items-center gap-6 text-sm font-semibold text-white lg:flex",
  navLinkActive: "text-accent-400",
  actions: "ml-auto flex items-center gap-1.5",
  iconButton: "rounded-full p-2 hover:bg-white/10",
  actionIcon: "size-5",
  chatButton: "relative rounded-full p-2 hover:bg-white/10",
  chatBadge:
    "absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white",
  sellButton: "hidden sm:inline-flex",
  mobileToggleButton: "rounded-full p-2 hover:bg-white/10 lg:hidden",
  mobilePanel: "border-t border-white/10 p-3 lg:hidden",
  mobileSearchForm: "relative mb-3",
  mobileSearchInput:
    "w-full rounded-full border border-white/10 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none",
  mobileNavLinks: "flex flex-col gap-1 border-b border-white/10 pb-3",
  mobileNavLink:
    "rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10",
  mobileSellButton: "mt-3 w-full",
  loginButton:
    "!text-white rounded-full border border-white/30 hover:!bg-white/10 hover:border-white/60",
};

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isSeller } = useAuth();
  const chatUnread = useAppSelector(selectChatUnreadTotal);
  const loginModalIntent = useAppSelector(selectLoginModalIntent);
  const dispatch = useAppDispatch();
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
          <span className={classes.logoMark}>M</span>
          <span className={classes.logoText}>
            <span className={classes.logoName}>MAPZHA</span>
            <span className={classes.logoTagline}>ELECTRONICS MARKETPLACE</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className={classes.desktopSearchForm}>
          <Search className={classes.searchIcon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Phones, Laptops, Tablets, Smartwatches..."
            className={classes.desktopSearchInput}
          />
          <button
            type="submit"
            className={classes.desktopSearchButton}
            aria-label="Search"
          >
            <Search className={classes.desktopSearchButtonIcon} />
          </button>
        </form>

        <nav className={classes.navLinks}>
          {NAV_LINKS.map((link) => {
            const intent = NAV_LOGIN_INTENTS[link.label];
            if (intent && !isAuthenticated) {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => dispatch(openLoginModal(intent))}
                >
                  {link.label}
                </button>
              );
            }
            return (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  clsx(isActive && classes.navLinkActive)
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

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
                  Sell Your Device
                </Button>
              )}
              <UserMenu />
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={classes.loginButton}
              onClick={() => dispatch(openLoginModal())}
            >
              Login
            </Button>
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
          <div className={classes.mobileNavLinks}>
            {NAV_LINKS.map((link) => {
              const intent = NAV_LOGIN_INTENTS[link.label];
              if (intent && !isAuthenticated) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      dispatch(openLoginModal(intent));
                      setMobileOpen(false);
                    }}
                    className={clsx(classes.mobileNavLink, "text-left")}
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={classes.mobileNavLink}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          {isSeller && (
            <Button
              className={classes.mobileSellButton}
              onClick={() => {
                navigate(PATHS.sell);
                setMobileOpen(false);
              }}
            >
              Sell Your Device
            </Button>
          )}
        </div>
      )}

      <LoginModal
        intent={loginModalIntent}
        onClose={() => dispatch(closeLoginModal())}
      />
    </header>
  );
};

export default Navbar;
