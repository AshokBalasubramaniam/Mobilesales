import { Link } from "react-router-dom";
import { BadgeCheck, Heart, Star } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/format";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../features/wishlist/thunks";
import { selectIsWishlisted } from "../../features/wishlist/selectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../hooks/useAuth";
import { DEVICE_ICON, isPlaceholderImage } from "../../utils/deviceIcons";
import type { Mobile } from "../../types/models";

export interface ProductCardProps {
  mobile: Mobile;
  isNew?: boolean;
}

const classes = {
  card: "flex shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
  imageWrap:
    "relative bg-gradient-to-br from-brand-50 to-gray-50 p-2",
  image: "size-full object-contain",
  noImage: "flex size-full items-center justify-center text-brand-200",
  cornerBadge:
    "absolute top-2 left-2 z-10 rounded-md px-2 py-0.5 text-xs font-bold text-white",
  wishlistButton:
    "absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full bg-white shadow",
  wishlistIcon: "size-3.5",
  wishlistIconActive: "fill-red-500 text-red-500",
  wishlistIconInactive: "text-gray-400",
  body: "flex flex-1 flex-col p-3",
  name: "mb-0.5 truncate text-xs font-semibold leading-tight text-gray-800",
  specs: "mb-0.5 truncate text-xs text-gray-400",
  conditionRow: "mb-2 flex items-center gap-1",
  conditionDot: "size-1.5 shrink-0 rounded-full bg-brand-500",
  conditionText: "text-xs text-brand-700",
  priceRow: "mb-1 flex items-baseline gap-1.5",
  price: "text-sm font-bold text-gray-900",
  mrp: "text-xs text-gray-400 line-through",
  footerRow: "mt-auto flex items-center justify-between gap-1",
  verifiedRow: "flex min-w-0 items-center gap-1",
  verifiedIcon: "size-3 shrink-0 fill-brand-600 text-white",
  verifiedText: "truncate text-xs font-medium text-brand-700",
  ratingRow: "flex shrink-0 items-center gap-0.5",
  ratingIcon: "size-3 fill-amber-400 text-amber-400",
  ratingText: "text-xs font-semibold text-gray-700",
};

const ProductCard = ({ mobile, isNew }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const isWishlisted = useAppSelector(selectIsWishlisted(mobile._id));
  const seller = typeof mobile.seller === "string" ? undefined : mobile.seller;

  const discount = mobile.mrp
    ? Math.round(((mobile.mrp - mobile.price) / mobile.mrp) * 100)
    : 0;
  const primaryImage =
    mobile.images?.find((i) => i.isPrimary) || mobile.images?.[0];
  const showImage = primaryImage && !isPlaceholderImage(primaryImage.url);
  const CategoryIcon = DEVICE_ICON[mobile.category];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please login to save listings");
    dispatch(
      isWishlisted ? removeFromWishlist(mobile._id) : addToWishlist(mobile._id),
    );
  };

  return (
    <Link
      to={`/mobiles/${mobile._id}`}
      className={classes.card}
      style={{ width: 170 }}
    >
      <div className={classes.imageWrap} style={{ height: 130 }}>
        {(isNew || discount > 0) && (
          <span
            className={classes.cornerBadge}
            style={{ backgroundColor: isNew ? "#f59e0b" : "#16a34a" }}
          >
            {isNew ? "NEW" : `${discount}% OFF`}
          </span>
        )}
        <button
          onClick={handleWishlist}
          className={classes.wishlistButton}
          aria-label="Toggle wishlist"
        >
          <Heart
            className={clsx(
              classes.wishlistIcon,
              isWishlisted
                ? classes.wishlistIconActive
                : classes.wishlistIconInactive,
            )}
          />
        </button>
        {showImage ? (
          <img
            src={primaryImage.url}
            alt={`${mobile.brand} ${mobile.model}`}
            loading="lazy"
            className={classes.image}
          />
        ) : (
          <div className={classes.noImage}>
            <CategoryIcon className="size-10" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className={classes.body}>
        <p className={classes.name}>
          {mobile.brand} {mobile.model}
        </p>
        {mobile.storage && mobile.ram && (
          <p className={classes.specs}>
            {mobile.storage}GB &bull; {mobile.ram}GB RAM
          </p>
        )}
        <div className={classes.conditionRow}>
          <span className={classes.conditionDot} />
          <span className={clsx(classes.conditionText, "capitalize")}>
            {mobile.condition} Condition
          </span>
        </div>
        <div className={classes.priceRow}>
          <span className={classes.price}>{formatCurrency(mobile.price)}</span>
          {mobile.mrp && (
            <span className={classes.mrp}>{formatCurrency(mobile.mrp)}</span>
          )}
        </div>
        <div className={classes.footerRow}>
          {seller?.sellerProfile?.isVerified ? (
            <span className={classes.verifiedRow}>
              <BadgeCheck className={classes.verifiedIcon} />
              <span className={classes.verifiedText}>Verified Seller</span>
            </span>
          ) : (
            <span />
          )}
          {!!seller?.ratingAvg && (
            <span className={classes.ratingRow}>
              <Star className={classes.ratingIcon} />
              <span className={classes.ratingText}>
                {seller.ratingAvg.toFixed(1)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
