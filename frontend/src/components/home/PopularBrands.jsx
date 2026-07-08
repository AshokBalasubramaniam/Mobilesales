import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';

const PopularBrands = ({ brands }) => {
  if (!brands?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">Popular Brands</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {brands.map(({ brand, count }) => (
          <Link
            key={brand}
            to={`/mobiles?brand=${encodeURIComponent(brand)}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-brand-400 hover:shadow-sm dark:border-gray-800"
          >
            <Smartphone className="size-6 text-brand-600" />
            <span className="text-sm font-medium">{brand}</span>
            <span className="text-xs text-gray-500">{count} listed</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularBrands;
