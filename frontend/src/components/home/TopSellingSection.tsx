import ProductCarousel from "./ProductCarousel";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";

export interface TopSellingSectionProps {
  listings?: Mobile[];
  loading?: boolean;
}

const TopSellingSection = ({ listings, loading }: TopSellingSectionProps) => (
  <ProductCarousel
    title="Top Selling"
    subtitle="Most popular with buyers"
    viewAllHref={`${PATHS.search}?sort=popular`}
    listings={listings}
    loading={loading}
  />
);

export default TopSellingSection;
