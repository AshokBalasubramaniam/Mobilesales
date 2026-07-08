import { SmartphoneNfc } from 'lucide-react';
import ListingCard from './ListingCard';
import ListingCardSkeleton from './ListingCardSkeleton';
import EmptyState from '../common/EmptyState';

const ListingGrid = ({ listings, loading, emptyTitle = 'No listings found', columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', ...cardProps }) => {
  if (loading) {
    return (
      <div className={`grid ${columns} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return <EmptyState icon={SmartphoneNfc} title={emptyTitle} description="Try adjusting your filters or check back later." />;
  }

  return (
    <div className={`grid ${columns} gap-4`}>
      {listings.map((mobile) => (
        <ListingCard key={mobile._id} mobile={mobile} {...cardProps} />
      ))}
    </div>
  );
};

export default ListingGrid;
