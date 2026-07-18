import { SmartphoneNfc } from "lucide-react";
import ListingCard, { type ListingCardProps } from "./ListingCard";
import ListingCardSkeleton from "./ListingCardSkeleton";
import EmptyState from "../common/EmptyState";
import type { Mobile } from "../../types/models";

export interface ListingGridProps extends Omit<ListingCardProps, "mobile"> {
  listings?: Mobile[] | null;
  loading?: boolean;
  emptyTitle?: string;
  columns?: string;
}

const classes = {
  gridBase: "grid",
  gridGap: "gap-4",
};

const ListingGrid = ({
  listings,
  loading,
  emptyTitle = "No listings found",
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  ...cardProps
}: ListingGridProps) => {
  if (loading) {
    return (
      <div className={`${classes.gridBase} ${columns} ${classes.gridGap}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <EmptyState
        icon={SmartphoneNfc}
        title={emptyTitle}
        description="Try adjusting your filters or check back later."
      />
    );
  }

  return (
    <div className={`${classes.gridBase} ${columns} ${classes.gridGap}`}>
      {listings.map((mobile) => (
        <ListingCard key={mobile._id} mobile={mobile} {...cardProps} />
      ))}
    </div>
  );
};

export default ListingGrid;
