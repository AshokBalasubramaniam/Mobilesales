import { Link } from "react-router-dom";
import { Smartphone } from "lucide-react";
import Card from "../common/Card";

export interface PopularBrandsProps {
  brands?: { brand: string; count: number }[];
}

const classes = {
  section: "mx-auto max-w-7xl px-4 py-8",
  title: "mb-4 text-xl font-bold",
  grid: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8",
  link: "contents",
  card: "flex flex-col items-center gap-2 text-center",
  icon: "size-6 text-brand-600",
  brandName: "text-sm font-medium",
  count: "text-xs text-gray-500",
};

const PopularBrands = ({ brands }: PopularBrandsProps) => {
  if (!brands?.length) return null;

  return (
    <section className={classes.section}>
      <h2 className={classes.title}>Popular Brands</h2>
      <div className={classes.grid}>
        {brands.map(({ brand, count }) => (
          <Link
            key={brand}
            to={`/mobiles?brand=${encodeURIComponent(brand)}`}
            className={classes.link}
          >
            <Card padding="sm" hoverable className={classes.card}>
              <Smartphone className={classes.icon} />
              <span className={classes.brandName}>{brand}</span>
              <span className={classes.count}>{count} listed</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularBrands;
