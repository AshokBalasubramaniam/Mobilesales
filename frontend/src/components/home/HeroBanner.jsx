import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, BadgeCheck, Truck } from 'lucide-react';
import Button from '../common/Button';
import { PATHS } from '../../routes/paths';

const HeroBanner = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `${PATHS.search}?q=${encodeURIComponent(query)}` : PATHS.search);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Buy & sell used phones, safely.</h1>
          <p className="mt-4 text-base text-brand-100 sm:text-lg">
            Verified sellers, checked IMEIs, and secure payments — India's trusted marketplace for second-hand mobiles.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search iPhone 13, Galaxy S22..."
                className="w-full rounded-full py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none"
              />
            </div>
            <Button type="submit" size="lg" variant="accent" className="rounded-full">
              Search
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-brand-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Verified Sellers
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-4" /> IMEI Checked
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4" /> Fast Delivery
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
