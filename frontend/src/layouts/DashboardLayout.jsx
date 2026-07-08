import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const DashboardLayout = ({ title, links }) => (
  <div className="mx-auto max-w-7xl px-4 py-8">
    <h1 className="mb-6 text-2xl font-bold">{title}</h1>
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="shrink-0 lg:w-60">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  </div>
);

export default DashboardLayout;
