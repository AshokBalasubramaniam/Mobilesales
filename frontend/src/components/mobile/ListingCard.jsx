import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, BadgeCheck, MapPin, Eye } from 'lucide-react';
import clsx from 'clsx';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/format';
import { addToWishlist, removeFromWishlist, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ListingCard = ({ mobile, onCompareToggle, compareIds }) => {
  const compareChecked = compareIds?.includes(mobile._id) ?? false;
  const dispatch = useDispatch();
  const { isAuthenticated, isBuyer } = useAuth();
  const isWishlisted = useSelector(selectIsWishlisted(mobile._id));

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to save listings');
    dispatch(isWishlisted ? removeFromWishlist(mobile._id) : addToWishlist(mobile._id));
  };

  const discount = mobile.mrp ? Math.round(((mobile.mrp - mobile.price) / mobile.mrp) * 100) : 0;
  const primaryImage = mobile.images?.find((i) => i.isPrimary) || mobile.images?.[0];

  return (
    <Link
      to={`/mobiles/${mobile._id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={`${mobile.brand} ${mobile.model}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-400">No image</div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-gray-900/90"
          aria-label="Toggle wishlist"
        >
          <Heart className={clsx('size-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500')} />
        </button>

        {discount > 0 && (
          <Badge variant="green" className="absolute top-2 left-2">
            {discount}% off
          </Badge>
        )}

        {isBuyer && onCompareToggle && (
          <label className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow dark:bg-gray-900/90">
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

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {mobile.brand} {mobile.model}
          </h3>
          {mobile.imeiVerified && <BadgeCheck className="size-4 shrink-0 text-brand-600" />}
        </div>

        <p className="text-xs text-gray-500">
          {mobile.storage}GB · {mobile.ram}GB RAM · {mobile.condition}
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(mobile.price)}</span>
          {mobile.mrp && <span className="text-xs text-gray-400 line-through">{formatCurrency(mobile.mrp)}</span>}
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="size-3.5 shrink-0" />
            {mobile.location?.city}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Eye className="size-3.5" />
            {mobile.views ?? 0}
          </span>
        </div>

        {mobile.seller?.sellerProfile?.isVerified && (
          <Badge variant="brand" icon={BadgeCheck} className="mt-1 w-fit">
            Verified Seller
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
