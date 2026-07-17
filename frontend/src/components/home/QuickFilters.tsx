import { Link } from "react-router-dom";

interface PriceBucket {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_BUCKETS: PriceBucket[] = [
  { label: "Under ₹10,000", maxPrice: 10000 },
  { label: "₹10,000 - ₹20,000", minPrice: 10000, maxPrice: 20000 },
  { label: "₹20,000 - ₹40,000", minPrice: 20000, maxPrice: 40000 },
  { label: "Above ₹40,000", minPrice: 40000 },
];

const toQuery = (params: PriceBucket): string => {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined,
  );
  return new URLSearchParams(
    entries.map(([key, value]) => [key, String(value)]),
  ).toString();
};

const classes = {
  section: "mx-auto max-w-7xl px-4 py-8",
  title: "mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide",
  list: "flex flex-wrap gap-2",
  bucket:
    "rounded-full border border-gray-300 px-4 py-1.5 text-sm hover:border-brand-500 hover:text-brand-600 dark:border-gray-700",
};

const QuickFilters = () => (
  <section className={classes.section}>
    <h2 className={classes.title}>Shop by price</h2>
    <div className={classes.list}>
      {PRICE_BUCKETS.map((bucket) => (
        <Link
          key={bucket.label}
          to={`/mobiles?${toQuery(bucket)}`}
          className={classes.bucket}
        >
          {bucket.label}
        </Link>
      ))}
    </div>
  </section>
);

export default QuickFilters;
