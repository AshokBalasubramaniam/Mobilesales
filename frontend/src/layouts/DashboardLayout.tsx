import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavLink {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface DashboardLayoutProps {
  title: string;
  links: DashboardNavLink[];
}

const classes = {
  container: "mx-auto max-w-7xl px-4 py-8",
  title: "mb-6 text-2xl font-bold",
  layout: "flex flex-col gap-6 lg:flex-row",
  aside: "shrink-0 lg:w-60",
  nav: "flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible",
  navLinkBase:
    "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
  navLinkActive: "bg-brand-600 text-white",
  navLinkInactive:
    "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
  navIcon: "size-4",
  content: "min-w-0 flex-1",
};

const DashboardLayout = ({ title, links }: DashboardLayoutProps) => (
  <div className={classes.container}>
    <h1 className={classes.title}>{title}</h1>
    <div className={classes.layout}>
      <aside className={classes.aside}>
        <nav className={classes.nav}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  classes.navLinkBase,
                  isActive ? classes.navLinkActive : classes.navLinkInactive,
                )
              }
            >
              <Icon className={classes.navIcon} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className={classes.content}>
        <Outlet />
      </div>
    </div>
  </div>
);

export default DashboardLayout;
