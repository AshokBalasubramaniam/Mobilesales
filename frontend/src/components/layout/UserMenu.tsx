import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Settings, ShoppingBag } from "lucide-react";
import Avatar from "../common/Avatar";
import { useAppDispatch } from "../../app/hooks";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../features/auth/thunks";
import { PATHS, getDashboardPath } from "../../routes/paths";

const classes = {
  container: "relative",
  trigger: "flex items-center gap-2 rounded-full",
  panel:
    "absolute right-0 z-40 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900",
  header: "border-b border-gray-100 p-2.5 dark:border-gray-800",
  name: "truncate text-sm font-semibold",
  email: "truncate text-xs text-gray-500",
  menuItem:
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
  menuItemIcon: "size-4",
  logoutButton:
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
};

const UserMenu = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(PATHS.home);
  };

  if (!user) return null;

  const dashboardPath = getDashboardPath(user.role);

  return (
    <div className={classes.container} ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className={classes.trigger}>
        <Avatar src={user.avatar} name={user.name} size="sm" />
      </button>

      {open && (
        <div className={classes.panel}>
          <div className={classes.header}>
            <p className={classes.name}>{user.name}</p>
            <p className={classes.email}>{user.email}</p>
          </div>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className={classes.menuItem}
          >
            <LayoutDashboard className={classes.menuItemIcon} /> Dashboard
          </Link>
          <Link
            to={PATHS.buyer.orders}
            onClick={() => setOpen(false)}
            className={classes.menuItem}
          >
            <ShoppingBag className={classes.menuItemIcon} /> My Orders
          </Link>
          <Link
            to={PATHS.buyer.profile}
            onClick={() => setOpen(false)}
            className={classes.menuItem}
          >
            <Settings className={classes.menuItemIcon} /> Profile Settings
          </Link>
          <button onClick={handleLogout} className={classes.logoutButton}>
            <LogOut className={classes.menuItemIcon} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
