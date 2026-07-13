import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import Card from '../common/Card';

export interface PopularBrandsProps {
  brands?: { brand: string; count: number }[];
}

const PopularBrands = ({ brands }: PopularBrandsProps) => {
  if (!brands?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">Popular Brands</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {brands.map(({ brand, count }) => (
          // `contents` keeps Link box-less so the whole Card (incl. its padding) stays
          // the click target, since Card itself can only render a <div>, not an <a>.
          <Link key={brand} to={`/mobiles?brand=${encodeURIComponent(brand)}`} className="contents">
            <Card padding="sm" hoverable className="flex flex-col items-center gap-2 text-center">
              <Smartphone className="size-6 text-brand-600" />
              <span className="text-sm font-medium">{brand}</span>
              <span className="text-xs text-gray-500">{count} listed</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularBrands;
