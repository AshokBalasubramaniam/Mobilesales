import { Link, Outlet } from 'react-router-dom';
import { Smartphone, ShieldCheck, Tag, MessageCircle, Lock, Headphones, Award, type LucideIcon } from 'lucide-react';
import { PATHS } from '../routes/paths';

interface Feature {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
}

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  { icon: ShieldCheck, iconBg: 'bg-brand-500', title: 'Secure & Trusted', description: '100% safe transactions' },
  { icon: Tag, iconBg: 'bg-fuchsia-500', title: 'Best Deals', description: 'Find the best prices' },
  { icon: MessageCircle, iconBg: 'bg-blue-500', title: 'Chat & Connect', description: 'Talk to buyers & sellers' },
];

const TRUST_BADGES: TrustBadge[] = [
  { icon: Lock, title: 'Secure Payments', description: 'Safe & encrypted' },
  { icon: Headphones, title: '24/7 Support', description: "We're here to help" },
  { icon: Award, title: 'Trusted Platform', description: 'Thousands of happy users' },
];

const PhoneMockup = () => (
  <div className="relative mx-auto mt-10 h-48 w-64">
    <div className="absolute bottom-0 left-1/2 h-6 w-56 -translate-x-1/2 rounded-full bg-black/20 blur-md" />
    <div className="absolute bottom-4 left-6 h-40 w-24 -rotate-6 rounded-2xl border border-white/20 bg-gradient-to-b from-white/25 to-white/5 shadow-xl backdrop-blur-sm" />
    <div className="absolute right-6 bottom-4 h-44 w-24 rotate-3 rounded-2xl border border-white/20 bg-gradient-to-b from-white/30 to-white/10 shadow-2xl backdrop-blur-sm">
      <div className="absolute inset-x-3 top-3 h-1 rounded-full bg-white/20" />
      <Smartphone className="absolute inset-0 m-auto size-8 text-white/70" />
    </div>
  </div>
);

const AuthLayout = () => (
  <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Marketing / brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-12 py-12 lg:flex lg:w-1/2 lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute top-1/3 -right-10 size-40 rounded-full bg-white/5 blur-2xl" />

        <Link to={PATHS.home} className="mb-10 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-lg">
            <Smartphone className="size-6" />
          </span>
          <span>
            <span className="block text-lg font-bold text-white">Mobile Sales</span>
            <span className="block text-xs text-brand-100">Buy & Sell Phones with Trust</span>
          </span>
        </Link>

        <h1 className="text-4xl font-extrabold text-white">
          Buy. Sell.
          <br />
          <span className="text-brand-200">Connect.</span>
        </h1>
        <p className="mt-3 max-w-sm text-sm text-brand-100">India's trusted marketplace for new &amp; second-hand mobiles.</p>

        <div className="mt-10 space-y-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${f.iconBg} text-white`}>
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-brand-100">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <PhoneMockup />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link to={PATHS.home} className="mb-6 flex items-center justify-center gap-1.5 text-xl font-bold text-brand-600 lg:hidden">
            <Smartphone className="size-7" /> Mobile Sales
          </Link>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Outlet />
          </div>
        </div>
      </div>
    </div>

    {/* Trust bar */}
    <div className="border-t border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:justify-around">
        {TRUST_BADGES.map((b) => (
          <div key={b.title} className="flex items-center justify-center gap-3 sm:justify-start">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30">
              <b.icon className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{b.title}</p>
              <p className="text-xs text-gray-500">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AuthLayout;
