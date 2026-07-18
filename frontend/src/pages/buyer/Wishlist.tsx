import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Share2, ShoppingBag, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../../features/wishlist/thunks";
import {
  selectWishlistItems,
  selectWishlistStatus,
} from "../../features/wishlist/selectors";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { formatCurrency } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";

const classes = {
  browseLink: "text-sm font-medium text-brand-600 hover:underline",
  list: "space-y-3",
  item: "flex items-center gap-4 rounded-xl border border-gray-200 p-4",
  thumbnail: "size-20 rounded-lg bg-gray-100 object-cover",
  info: "flex-1",
  title: "font-semibold hover:text-brand-600",
  meta: "text-sm text-gray-500",
  price: "mt-1 font-bold",
  actions: "flex flex-col gap-2 sm:flex-row",
};

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
      navigator
        .share({ title: `${mobile.brand} ${mobile.model}`, url })
        .catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  if (status === "loading") return <Spinner full />;

  if (!items.length) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save phones you're interested in to find them here later."
        action={
          <Link to={PATHS.search} className={classes.browseLink}>
            Browse phones
          </Link>
        }
      />
    );
  }

  return (
    <div className={classes.list}>
      {items.map(({ _id, mobile }) => (
        <div key={_id} className={classes.item}>
          <img
            src={mobile.images?.[0]?.url}
            alt={mobile.model}
            className={classes.thumbnail}
          />
          <div className={classes.info}>
            <Link to={PATHS.mobileDetail(mobile._id)} className={classes.title}>
              {mobile.brand} {mobile.model}
            </Link>
            <p className={classes.meta}>
              {mobile.storage}GB · {mobile.condition}
            </p>
            <p className={classes.price}>{formatCurrency(mobile.price)}</p>
          </div>
          <div className={classes.actions}>
            <Button
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate(PATHS.checkout(mobile._id))}
            >
              Buy Now
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Share2}
              onClick={() => handleShare(mobile)}
            >
              Share
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Trash2}
              onClick={() => dispatch(removeFromWishlist(mobile._id))}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Wishlist;
