import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { BadgeCheck, Calendar, MessageCircle } from "lucide-react";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import Avatar from "../../components/common/Avatar";
import StarRating from "../../components/common/StarRating";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import ListingGrid from "../../components/mobile/ListingGrid";
import ReviewList from "../../components/mobile/ReviewList";
import { formatDate } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";
import type { Mobile, Review, User } from "../../types/models";

const classes = {
  page: "mx-auto max-w-6xl px-4 py-8",
  header:
    "flex flex-col items-center gap-4 rounded-2xl border border-gray-200 p-8 text-center sm:flex-row sm:text-left dark:border-gray-800",
  headerInfo: "flex-1",
  nameRow: "flex items-center justify-center gap-1.5 sm:justify-start",
  name: "text-xl font-bold",
  verifiedIcon: "size-5 text-brand-600",
  ratingRow: "mt-1 flex justify-center sm:justify-start",
  reviewCount: "mt-1 text-sm text-gray-500",
  memberSince:
    "mt-1 flex items-center justify-center gap-1 text-xs text-gray-400 sm:justify-start",
  calendarIcon: "size-3.5",
  section: "mt-10",
  sectionHeading: "mb-4 text-lg font-bold",
};

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState<User | null>(null);
  const [listings, setListings] = useState<Mobile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<User>>(`/users/${id}/public`),
      api.get<ApiResponse<Mobile[]>>("/mobiles", { params: { seller: id } }),
      api.get<ApiResponse<Review[]>>(`/reviews/seller/${id}`),
    ])
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
    if (!isAuthenticated)
      return toast.error("Please login to chat with this seller");
    if (!id) return;
    setChatLoading(true);
    try {
      const { data } = await api.post<ApiResponse<{ _id: string }>>(
        "/chat/conversations",
        { recipientId: id },
      );
      navigate(PATHS.chatConversation(data.data._id));
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not start chat",
      );
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.header}>
        <Avatar src={seller.avatar} name={seller.name} size="xl" />
        <div className={classes.headerInfo}>
          <div className={classes.nameRow}>
            <h1 className={classes.name}>{seller.name}</h1>
            {seller.sellerProfile?.isVerified && (
              <BadgeCheck className={classes.verifiedIcon} />
            )}
          </div>
          {/* StarRating (common/StarRating.tsx) has no className prop — wrap instead of passing one through. */}
          <div className={classes.ratingRow}>
            <StarRating value={seller.ratingAvg} />
          </div>
          <p className={classes.reviewCount}>{seller.ratingCount} reviews</p>
          <p className={classes.memberSince}>
            <Calendar className={classes.calendarIcon} /> Member since{" "}
            {formatDate(seller.createdAt)}
          </p>
        </div>
        {!isOwnProfile && (
          <Button
            icon={MessageCircle}
            loading={chatLoading}
            onClick={handleChat}
          >
            Chat with Seller
          </Button>
        )}
      </div>

      <div className={classes.section}>
        <h2 className={classes.sectionHeading}>
          Active Listings ({listings.length})
        </h2>
        <ListingGrid
          listings={listings}
          loading={false}
          emptyTitle="No active listings"
        />
      </div>

      <div className={classes.section}>
        <h2 className={classes.sectionHeading}>Reviews</h2>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
};

export default SellerProfile;
