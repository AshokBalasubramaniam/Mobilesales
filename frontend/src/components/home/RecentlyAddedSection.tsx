import ProductCarousel from "./ProductCarousel";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";

export interface RecentlyAddedSectionProps {
  listings?: Mobile[];
  loading?: boolean;
}

const RecentlyAddedSection = ({
  listings,
  loading,
}: RecentlyAddedSectionProps) => (
  <ProductCarousel
    title="Recently Added"
    subtitle="Freshly listed phones"
    viewAllHref={`${PATHS.search}?sort=newest`}
    listings={listings}
    loading={loading}
    isNew
  />
);

export default RecentlyAddedSection;
