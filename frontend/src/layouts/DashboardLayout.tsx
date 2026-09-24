import type { ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
  subtitle?: string;
  links: DashboardNavLink[];
  // Card pinned to the bottom of the sidebar (desktop only)
  promo?: ReactNode;
}

const classes = {
  shell: "bg-gray-50",
  // Full width (no centred max-width) so the sidebar sits flush left and the
  // content uses all the remaining space.
  container: "flex flex-col lg:min-h-[calc(100vh-4rem)] lg:flex-row",
  aside:
    "shrink-0 bg-brand-900 lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:w-56 lg:flex-col lg:overflow-y-auto",
  sectionLabel:
    "hidden px-4 pt-5 pb-2 text-[10px] font-bold tracking-[0.2em] text-brand-300 uppercase lg:block",
  nav: "flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:pt-0",
  navLinkBase:
    "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
  navLinkActive: "bg-brand-500 font-bold text-white",
  navLinkInactive: "font-medium text-brand-200/80 hover:bg-white/5 hover:text-white",
  navIcon: "size-4",
  promo: "mx-3 mt-auto mb-4 hidden lg:block",
  main: "min-w-0 flex-1 px-4 py-6 lg:px-7 lg:py-7",
  header: "mb-6",
  title:
    "font-display text-3xl font-black tracking-wide text-gray-900 uppercase lg:text-4xl",
  subtitle: "mt-1 text-sm text-gray-500",
};

const DashboardLayout = ({
  title,
  subtitle,
  links,
  promo,
}: DashboardLayoutProps) => {
  const { pathname } = useLocation();

  return (
    <div className={classes.shell}>
      <div className={classes.container}>
        <aside className={classes.aside}>
          <p className={classes.sectionLabel}>{title}</p>
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
          {promo && <div className={classes.promo}>{promo}</div>}
        </aside>
        <main className={classes.main}>
          <div className={classes.header}>
            <h1 className={classes.title}>{title}</h1>
            {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
          </div>
          {/* Keyed by path so each account page fades in; the sidebar stays */}
          <div key={pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
