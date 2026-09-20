import ProductCarousel from "./ProductCarousel";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";

export interface RecommendedSectionProps {
  listings?: Mobile[];
  loading?: boolean;
}

const RecommendedSection = ({ listings, loading }: RecommendedSectionProps) => (
  <ProductCarousel
    title="Recommended For You"
    subtitle="Based on popular choices from shoppers"
    viewAllHref={PATHS.search}
    listings={listings}
    loading={loading}
  />
);

export default RecommendedSection;
