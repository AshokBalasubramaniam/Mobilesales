import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ListingGrid from '../mobile/ListingGrid';

const HomeSection = ({ title, subtitle, viewAllHref, listings, loading }) => {
  if (!loading && !listings?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link to={viewAllHref} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View all <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      <ListingGrid listings={listings} loading={loading} />
    </section>
  );
};

export default HomeSection;
