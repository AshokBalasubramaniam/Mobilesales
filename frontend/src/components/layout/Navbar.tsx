import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Moon, Search, Sun, Menu, Smartphone, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useAuth } from '../../hooks/useAuth';
import { toggleTheme } from '../../features/ui/slice';
import { selectTheme } from '../../features/ui/selectors';
import { selectChatUnreadTotal } from '../../features/chat/selectors';
import { PATHS } from '../../routes/paths';
import Button from '../common/Button';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isSeller } = useAuth();
  const theme = useAppSelector(selectTheme);
  const chatUnread = useAppSelector(selectChatUnreadTotal);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query ? `${PATHS.search}?q=${encodeURIComponent(query)}` : PATHS.search);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to={PATHS.home} className="flex shrink-0 items-center gap-1.5 text-lg font-bold text-brand-600">
          <Smartphone className="size-6" />
          <span className="hidden sm:inline">Mobile Sales</span>
        </Link>

        <form onSubmit={handleSearch} className="relative hidden flex-1 md:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand, model..."
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to={PATHS.wishlist} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Wishlist">
                <Heart className="size-5" />
              </Link>
              <Link to={PATHS.chat} className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Chat">
                <MessageCircle className="size-5" />
                {chatUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
              </Link>
              <NotificationsMenu />
              {isSeller && (
                <Button size="sm" onClick={() => navigate(PATHS.sell)} className="hidden sm:inline-flex">
                  Sell Your Phone
                </Button>
              )}
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(PATHS.login)}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate(PATHS.register)} className="hidden sm:inline-flex">
                Sign Up
              </Button>
            </>
          )}

          <button className="rounded-full p-2 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 p-3 md:hidden dark:border-gray-800">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brand, model..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </form>
          {isSeller && (
            <Button className="w-full" onClick={() => { navigate(PATHS.sell); setMobileOpen(false); }}>
              Sell Your Phone
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
