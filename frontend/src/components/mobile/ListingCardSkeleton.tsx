const ListingCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
    <div className="skeleton aspect-square" />
    <div className="space-y-2 p-3.5">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-5 w-1/3" />
    </div>
  </div>
);

export default ListingCardSkeleton;
