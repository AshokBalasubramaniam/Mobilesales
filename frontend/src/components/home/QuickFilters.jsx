import { Link } from 'react-router-dom';

const PRICE_BUCKETS = [
  { label: 'Under ₹10,000', maxPrice: 10000 },
  { label: '₹10,000 - ₹20,000', minPrice: 10000, maxPrice: 20000 },
  { label: '₹20,000 - ₹40,000', minPrice: 20000, maxPrice: 40000 },
  { label: 'Above ₹40,000', minPrice: 40000 },
];

const toQuery = (params) => new URLSearchParams(params).toString();

const QuickFilters = () => (
  <section className="mx-auto max-w-7xl px-4 py-8">
    <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Shop by price</h2>
    <div className="flex flex-wrap gap-2">
      {PRICE_BUCKETS.map((bucket) => (
        <Link
          key={bucket.label}
          to={`/mobiles?${toQuery(bucket)}`}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-sm hover:border-brand-500 hover:text-brand-600 dark:border-gray-700"
        >
          {bucket.label}
        </Link>
      ))}
    </div>
  </section>
);

export default QuickFilters;
