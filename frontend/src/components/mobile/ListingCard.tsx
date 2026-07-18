import { Link } from "react-router-dom";
import { Heart, BadgeCheck, MapPin, Eye } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import Badge from "../common/Badge";
import { formatCurrency } from "../../utils/format";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../features/wishlist/thunks";
import { selectIsWishlisted } from "../../features/wishlist/selectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAuth } from "../../hooks/useAuth";
import type { Mobile } from "../../types/models";

export interface ListingCardProps {
  mobile: Mobile;
  onCompareToggle?: (mobile: Mobile) => void;
  compareIds?: string[];
}

const classes = {
  card: "group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg",
  imageWrapper:
    "relative aspect-square overflow-hidden bg-gray-100",
  image:
    "size-full object-cover transition-transform duration-300 group-hover:scale-105",
  noImage: "flex size-full items-center justify-center text-gray-400",
  wishlistButton:
    "absolute top-2 right-2 rounded-full bg-white/90 p-2 shadow hover:bg-white",
  wishlistIconBase: "size-4",
  wishlistIconActive: "fill-red-500 text-red-500",
  wishlistIconInactive: "text-gray-500",
  discountBadge: "absolute top-2 left-2",
  compareLabel:
    "absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow",
  body: "flex flex-1 flex-col gap-1.5 p-3.5",
  titleRow: "flex items-center gap-1.5",
  title: "truncate text-sm font-semibold text-gray-900",
  verifiedIcon: "size-4 shrink-0 text-brand-600",
  subtitle: "text-xs text-gray-500",
  priceRow: "mt-1 flex items-baseline gap-2",
  price: "text-lg font-bold text-gray-900",
  mrp: "text-xs text-gray-400 line-through",
  footerRow: "mt-1 flex items-center justify-between text-xs text-gray-500",
  locationInfo: "flex items-center gap-1 truncate",
  locationIcon: "size-3.5 shrink-0",
  viewsInfo: "flex items-center gap-1 shrink-0",
  viewsIcon: "size-3.5",
  verifiedSellerBadge: "mt-1 w-fit",
};

const ListingCard = ({
  mobile,
  onCompareToggle,
  compareIds,
}: ListingCardProps) => {
  const compareChecked = compareIds?.includes(mobile._id) ?? false;
  const dispatch = useAppDispatch();
  const { isAuthenticated, isBuyer } = useAuth();
  const isWishlisted = useAppSelector(selectIsWishlisted(mobile._id));
  const seller = typeof mobile.seller === "string" ? undefined : mobile.seller;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please login to save listings");
    dispatch(
      isWishlisted ? removeFromWishlist(mobile._id) : addToWishlist(mobile._id),
    );
  };

  const discount = mobile.mrp
    ? Math.round(((mobile.mrp - mobile.price) / mobile.mrp) * 100)
    : 0;
  const primaryImage =
    mobile.images?.find((i) => i.isPrimary) || mobile.images?.[0];

  return (
    <Link to={`/mobiles/${mobile._id}`} className={classes.card}>
      <div className={classes.imageWrapper}>
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={`${mobile.brand} ${mobile.model}`}
            loading="lazy"
            className={classes.image}
          />
        ) : (
          <div className={classes.noImage}>No image</div>
        )}

        <button
          onClick={handleWishlist}
          className={classes.wishlistButton}
          aria-label="Toggle wishlist"
        >
          <Heart
            className={clsx(
              classes.wishlistIconBase,
              isWishlisted
                ? classes.wishlistIconActive
                : classes.wishlistIconInactive,
            )}
          />
        </button>

        {discount > 0 && (
          <Badge variant="green" className={classes.discountBadge}>
            {discount}% off
          </Badge>
        )}

        {isBuyer && onCompareToggle && (
          <label className={classes.compareLabel}>
            <input
              type="checkbox"
              checked={compareChecked}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onCompareToggle(mobile);
              }}
            />
            Compare
          </label>
        )}
      </div>

      <div className={classes.body}>
        <div className={classes.titleRow}>
          <h3 className={classes.title}>
            {mobile.brand} {mobile.model}
          </h3>
          {mobile.imeiVerified && (
            <BadgeCheck className={classes.verifiedIcon} />
          )}
        </div>

        <p className={classes.subtitle}>
          {mobile.storage}GB · {mobile.ram}GB RAM · {mobile.condition}
        </p>

        <div className={classes.priceRow}>
          <span className={classes.price}>{formatCurrency(mobile.price)}</span>
          {mobile.mrp && (
            <span className={classes.mrp}>{formatCurrency(mobile.mrp)}</span>
          )}
        </div>

        <div className={classes.footerRow}>
          <span className={classes.locationInfo}>
            <MapPin className={classes.locationIcon} />
            {mobile.location?.city}
          </span>
          <span className={classes.viewsInfo}>
            <Eye className={classes.viewsIcon} />
            {mobile.views ?? 0}
          </span>
        </div>

        {seller?.sellerProfile?.isVerified && (
          <Badge
            variant="brand"
            icon={BadgeCheck}
            className={classes.verifiedSellerBadge}
          >
            Verified Seller
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
