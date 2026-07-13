import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Share2, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { selectWishlistItems, selectWishlistStatus } from '../../selectors/wishlist.selectors';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/format';
import { PATHS } from '../../routes/paths';
import type { Mobile } from '../../types/models';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectWishlistItems);
  const status = useAppSelector(selectWishlistStatus);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleShare = async (mobile: Mobile) => {
    const url = `${window.location.origin}${PATHS.mobileDetail(mobile._id)}`;
    if (navigator.share) {
      navigator.share({ title: `${mobile.brand} ${mobile.model}`, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (status === 'loading') return <Spinner full />;

  if (!items.length) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save phones you're interested in to find them here later."
        action={
          <Link to={PATHS.search} className="text-sm font-medium text-brand-600 hover:underline">
            Browse phones
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ _id, mobile }) => (
        <div key={_id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <img
            src={mobile.images?.[0]?.url}
            alt={mobile.model}
            className="size-20 rounded-lg bg-gray-100 object-cover dark:bg-gray-800"
          />
          <div className="flex-1">
            <Link to={PATHS.mobileDetail(mobile._id)} className="font-semibold hover:text-brand-600">
              {mobile.brand} {mobile.model}
            </Link>
            <p className="text-sm text-gray-500">
              {mobile.storage}GB · {mobile.condition}
            </p>
            <p className="mt-1 font-bold">{formatCurrency(mobile.price)}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="sm" icon={ShoppingBag} onClick={() => navigate(PATHS.checkout(mobile._id))}>
              Buy Now
            </Button>
            <Button size="sm" variant="secondary" icon={Share2} onClick={() => handleShare(mobile)}>
              Share
            </Button>
            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => dispatch(removeFromWishlist(mobile._id))}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Wishlist;
