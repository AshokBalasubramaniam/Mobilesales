import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, Calendar, MessageCircle } from 'lucide-react';
import { usersApi } from '../../api/users.api';
import { mobilesApi } from '../../api/mobiles.api';
import { reviewsApi } from '../../api/reviews.api';
import { chatApi } from '../../api/chat.api';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ListingGrid from '../../components/mobile/ListingGrid';
import ReviewList from '../../components/mobile/ReviewList';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { PATHS } from '../../routes/paths';

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([usersApi.getPublicProfile(id), mobilesApi.list({ seller: id }), reviewsApi.bySeller(id)])
      .then(([sellerRes, listingsRes, reviewsRes]) => {
        setSeller(sellerRes.data.data);
        setListings(listingsRes.data.data);
        setReviews(reviewsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!seller) return null;

  const isOwnProfile = user?._id === id;

  const handleChat = async () => {
    if (!isAuthenticated) return toast.error('Please login to chat with this seller');
    setChatLoading(true);
    try {
      const { data } = await chatApi.startConversation({ recipientId: id });
      navigate(PATHS.chatConversation(data.data._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 p-8 text-center sm:flex-row sm:text-left dark:border-gray-800">
        <Avatar src={seller.avatar} name={seller.name} size="xl" />
        <div className="flex-1">
          <div className="flex items-center justify-center gap-1.5 sm:justify-start">
            <h1 className="text-xl font-bold">{seller.name}</h1>
            {seller.sellerProfile?.isVerified && <BadgeCheck className="size-5 text-brand-600" />}
          </div>
          <StarRating value={seller.ratingAvg} className="mt-1 justify-center sm:justify-start" />
          <p className="mt-1 text-sm text-gray-500">{seller.ratingCount} reviews</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400 sm:justify-start">
            <Calendar className="size-3.5" /> Member since {formatDate(seller.createdAt)}
          </p>
        </div>
        {!isOwnProfile && (
          <Button icon={MessageCircle} loading={chatLoading} onClick={handleChat}>
            Chat with Seller
          </Button>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold">Active Listings ({listings.length})</h2>
        <ListingGrid listings={listings} loading={false} emptyTitle="No active listings" />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold">Reviews</h2>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
};

export default SellerProfile;
