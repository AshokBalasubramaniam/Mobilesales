const classes = {
  container:
    "overflow-hidden rounded-xl border border-gray-200",
  image: "skeleton aspect-square",
  body: "space-y-2 p-3.5",
  titleLine: "skeleton h-4 w-3/4",
  subtitleLine: "skeleton h-3 w-1/2",
  priceLine: "skeleton h-5 w-1/3",
};

const ListingCardSkeleton = () => (
  <div className={classes.container}>
    <div className={classes.image} />
    <div className={classes.body}>
      <div className={classes.titleLine} />
      <div className={classes.subtitleLine} />
      <div className={classes.priceLine} />
    </div>
  </div>
);

export default ListingCardSkeleton;
