import { Link, Outlet } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { PATHS } from '../routes/paths';

const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
    <div className="w-full max-w-md">
      <Link to={PATHS.home} className="mb-8 flex items-center justify-center gap-1.5 text-xl font-bold text-brand-600">
        <Smartphone className="size-7" /> Mobile Sales
      </Link>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
