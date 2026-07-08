import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LayoutDashboard, LogOut, Settings, ShoppingBag } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';
import { PATHS } from '../../routes/paths';

const UserMenu = () => {
  const { user, isSeller, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const dashboardPath = isAdmin ? PATHS.admin.root : isSeller ? PATHS.seller.root : PATHS.buyer.root;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(PATHS.home);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full">
        <Avatar src={user.avatar} name={user.name} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-2.5 dark:border-gray-800">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <Link to={dashboardPath} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
          <Link to={PATHS.buyer.orders} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <ShoppingBag className="size-4" /> My Orders
          </Link>
          <Link to={PATHS.buyer.profile} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings className="size-4" /> Profile Settings
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
