import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import {
  BadgeCheck,
  Battery,
  Box,
  FileText,
  Heart,
  MessageCircle,
  ShieldCheck,
  Wrench,
  Zap,
  GitCompareArrows,
  type LucideIcon,
} from 'lucide-react';
import api from '../../api/api';
import type { ApiResponse } from '../../types/api';
import ImageGallery from '../../components/mobile/ImageGallery';
import PriceHistoryChart from '../../components/mobile/PriceHistoryChart';
import NegotiateModal from '../../components/mobile/NegotiateModal';
import ReviewList from '../../components/mobile/ReviewList';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import StarRating from '../../components/common/StarRating';
import Avatar from '../../components/common/Avatar';
import ReportButton from '../../components/common/ReportButton';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToWishlist, removeFromWishlist } from '../../features/wishlist/thunks';
import { selectIsWishlisted } from '../../features/wishlist/selectors';
import { PATHS } from '../../routes/paths';
import type { Mobile, PriceHistoryItem, Review, User } from '../../types/models';

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const InfoRow = ({ icon: Icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="size-4 text-gray-400" />
    <span className="text-gray-500">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

// The mobile detail endpoint populates `seller` with ratingAvg (backend
// mobile.controller.js#getById), which isn't part of the generic
// Mobile['seller'] Pick in src/types/models.ts — extend locally instead of
// widening the shared model type (same convention as FeaturedSellers.tsx).
type PopulatedSeller = Pick<User, '_id' | 'name' | 'avatar' | 'sellerProfile'> & { ratingAvg?: number };

const MobileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isBuyer, user } = useAuth();
  const isWishlisted = useAppSelector(selectIsWishlisted(id ?? ''));

  const [mobile, setMobile] = useState<Mobile | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<Mobile>>(`/mobiles/${id}`),
      api.get<ApiResponse<PriceHistoryItem[]>>(`/mobiles/${id}/price-history`),
      api.get<ApiResponse<Review[]>>(`/reviews/mobile/${id}`),
    ])
      .then(([mobileRes, historyRes, reviewsRes]) => {
        setMobile(mobileRes.data.data);
        setPriceHistory(historyRes.data.data);
        setReviews(reviewsRes.data.data);
      })
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!mobile) return null;

  const seller = typeof mobile.seller === 'string' ? undefined : (mobile.seller as PopulatedSeller);
  const isOwner = user?._id === seller?._id;

  const handleWishlist = () => {
    if (!isAuthenticated) return toast.error('Please login to save listings');
    dispatch(isWishlisted ? removeFromWishlist(mobile._id) : addToWishlist(mobile._id));
  };

  const handleChatSeller = async () => {
    if (!isAuthenticated) return toast.error('Please login to chat with the seller');
    if (!seller) return;
    setChatLoading(true);
    try {
      const { data } = await api.post<ApiResponse<{ _id: string }>>('/chat/conversations', { recipientId: seller._id, mobileId: mobile._id });
      navigate(PATHS.chatConversation(data.data._id));
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not start chat');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={mobile.images} videos={mobile.videos} />

        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {mobile.brand} {mobile.model}
              </h1>
              <p className="text-sm text-gray-500">
                {mobile.storage}GB · {mobile.ram}GB RAM · {mobile.color}
              </p>
            </div>
            <button onClick={handleWishlist} className="rounded-full border border-gray-200 p-2.5 dark:border-gray-700">
              <Heart className={isWishlisted ? 'size-5 fill-red-500 text-red-500' : 'size-5'} />
            </button>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatCurrency(mobile.price)}</span>
            {mobile.mrp && <span className="text-gray-400 line-through">{formatCurrency(mobile.mrp)}</span>}
            {mobile.negotiable && <Badge variant="brand">Negotiable</Badge>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {mobile.imeiVerified && (
              <Badge variant="brand" icon={BadgeCheck}>
                IMEI Verified
              </Badge>
            )}
            {mobile.warranty?.hasWarranty && (
              <Badge variant="green" icon={ShieldCheck}>
                Under Warranty
              </Badge>
            )}
            <Badge variant="amber" icon={Battery}>
              {mobile.batteryHealth}% Battery
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <InfoRow icon={Box} label="Original Box" value={mobile.originalBoxAvailable ? 'Yes' : 'No'} />
            <InfoRow icon={Zap} label="Charger" value={mobile.chargerIncluded ? 'Included' : 'Not included'} />
            <InfoRow
              icon={Wrench}
              label="Repairs"
              value={mobile.repairHistory?.length ? `${mobile.repairHistory.length} recorded` : 'None recorded'}
            />
            <InfoRow icon={FileText} label="Purchase Bill" value={mobile.purchaseBillUrl ? 'Available' : 'Not available'} />
          </div>

          {mobile.accessoriesIncluded?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mobile.accessoriesIncluded.map((acc) => (
                <Badge key={acc}>{acc}</Badge>
              ))}
            </div>
          )}

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{mobile.description}</p>

          {!isOwner && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="lg" onClick={() => navigate(PATHS.checkout(mobile._id))} disabled={!isBuyer && isAuthenticated}>
                Buy Now
              </Button>
              {mobile.negotiable && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => (isAuthenticated ? setNegotiateOpen(true) : toast.error('Please login to negotiate'))}
                >
                  Negotiate
                </Button>
              )}
              <Button size="lg" variant="secondary" icon={MessageCircle} loading={chatLoading} onClick={handleChatSeller}>
                Chat Seller
              </Button>
              <Button size="lg" variant="ghost" icon={GitCompareArrows} onClick={() => navigate(`${PATHS.compare}?ids=${mobile._id}`)}>
                Compare
              </Button>
            </div>
          )}
          {isOwner && (
            <Link to={PATHS.editListing(mobile._id)} className="mt-6 inline-block">
              <Button size="lg" variant="secondary">
                Edit Listing
              </Button>
            </Link>
          )}

          <Link
            to={`/users/${seller?._id}`}
            className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-brand-400 dark:border-gray-800"
          >
            <Avatar src={seller?.avatar} name={seller?.name} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{seller?.name}</span>
                {seller?.sellerProfile?.isVerified && <BadgeCheck className="size-4 text-brand-600" />}
              </div>
              <StarRating value={seller?.ratingAvg} />
            </div>
          </Link>
          {!isOwner && (
            <div className="mt-2">
              <ReportButton reportType="listing" targetId={mobile._id} label="Report this listing" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-bold">Price History</h2>
          <PriceHistoryChart history={priceHistory} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-bold">Reviews for this listing</h2>
          <ReviewList reviews={reviews} />
        </div>
      </div>

      <NegotiateModal open={negotiateOpen} onClose={() => setNegotiateOpen(false)} mobile={mobile} />
    </div>
  );
};

export default MobileDetail;
