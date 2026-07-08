import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
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
} from 'lucide-react';
import { mobilesApi } from '../../api/mobiles.api';
import { reviewsApi } from '../../api/reviews.api';
import { chatApi } from '../../api/chat.api';
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
import { addToWishlist, removeFromWishlist, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { PATHS } from '../../routes/paths';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="size-4 text-gray-400" />
    <span className="text-gray-500">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

const MobileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isBuyer, user } = useAuth();
  const isWishlisted = useSelector(selectIsWishlisted(id));

  const [mobile, setMobile] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([mobilesApi.getById(id), mobilesApi.getPriceHistory(id), reviewsApi.byMobile(id)])
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

  const isOwner = user?._id === mobile.seller?._id;

  const handleWishlist = () => {
    if (!isAuthenticated) return toast.error('Please login to save listings');
    dispatch(isWishlisted ? removeFromWishlist(mobile._id) : addToWishlist(mobile._id));
  };

  const handleChatSeller = async () => {
    if (!isAuthenticated) return toast.error('Please login to chat with the seller');
    setChatLoading(true);
    try {
      const { data } = await chatApi.startConversation({ recipientId: mobile.seller._id, mobileId: mobile._id });
      navigate(PATHS.chatConversation(data.data._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
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
            <InfoRow icon={Wrench} label="Repairs" value={mobile.repairHistory?.length ? `${mobile.repairHistory.length} recorded` : 'None recorded'} />
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
                <Button size="lg" variant="secondary" onClick={() => (isAuthenticated ? setNegotiateOpen(true) : toast.error('Please login to negotiate'))}>
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
            to={`/users/${mobile.seller?._id}`}
            className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-brand-400 dark:border-gray-800"
          >
            <Avatar src={mobile.seller?.avatar} name={mobile.seller?.name} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{mobile.seller?.name}</span>
                {mobile.seller?.sellerProfile?.isVerified && <BadgeCheck className="size-4 text-brand-600" />}
              </div>
              <StarRating value={mobile.seller?.ratingAvg} />
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
