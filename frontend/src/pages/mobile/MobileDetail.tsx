import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import clsx from "clsx";
import {
  BadgeCheck,
  Battery,
  Box,
  ChevronRight,
  Cpu,
  FileText,
  GitCompareArrows,
  HandCoins,
  HardDrive,
  Headphones,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Palette,
  Pencil,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import ImageGallery from "../../components/mobile/ImageGallery";
import PriceHistoryChart from "../../components/mobile/PriceHistoryChart";
import NegotiateModal from "../../components/mobile/NegotiateModal";
import ReviewList from "../../components/mobile/ReviewList";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import StarRating from "../../components/common/StarRating";
import Avatar from "../../components/common/Avatar";
import ReportButton from "../../components/common/ReportButton";
import { formatCurrency } from "../../utils/format";
import {
  BATTERY_HEALTH_CATEGORIES,
  DEVICE_CATEGORIES,
  SELLER_EDITABLE_STATUSES,
  STORAGE_RAM_CATEGORIES,
} from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../features/wishlist/thunks";
import { selectIsWishlisted } from "../../features/wishlist/selectors";
import { PATHS } from "../../routes/paths";
import type {
  Mobile,
  PriceHistoryItem,
  Review,
  User,
} from "../../types/models";

type DetailTab = "description" | "specifications" | "reviews" | "priceHistory";

type SpecItem = { icon?: LucideIcon; label: string; value: string };

const TRUST_BADGES = [
  { icon: Lock, title: "Secure Payment", sub: "100% safe & secure" },
  { icon: RotateCcw, title: "Buyer Protection", sub: "7 days replacement" },
  { icon: Truck, title: "Fast Delivery", sub: "Reliable shipping" },
  { icon: Headphones, title: "Dedicated Support", sub: "We're here to help" },
];

const classes = {
  page: "mx-auto max-w-6xl px-4 pb-12",
  breadcrumb: "flex flex-wrap items-center gap-2 py-4 text-sm text-gray-500",
  breadcrumbLink: "hover:text-brand-600",
  breadcrumbCurrent: "font-medium text-gray-900",
  breadcrumbSeparator: "size-3.5 text-gray-300",
  mainGrid: "grid grid-cols-1 gap-8 lg:grid-cols-2",
  wishlistButton:
    "flex size-10 items-center justify-center rounded-full bg-white shadow transition hover:scale-105",
  wishlistIconActive: "size-5 fill-red-500 text-red-500",
  wishlistIconInactive: "size-5 text-gray-700",
  details: "flex flex-col gap-4",
  brand: "text-sm text-gray-500",
  title: "mt-0.5 text-3xl font-bold",
  subtitle: "mt-1 text-sm text-gray-500",
  ratingRow: "flex items-center gap-2 text-sm",
  ratingValue: "font-semibold",
  ratingCount: "text-gray-400",
  badgeRow: "flex flex-wrap gap-2",
  pill: "border px-3 py-1 text-xs font-semibold",
  pillAmber: "border-amber-200",
  pillGreen: "border-green-200",
  pillBrand: "border-brand-200",
  priceRow: "flex flex-wrap items-center gap-3",
  price: "text-4xl font-black",
  mrp: "text-lg text-gray-400 line-through",
  discount:
    "rounded-full bg-brand-100 px-2.5 py-0.5 text-sm font-bold text-brand-700",
  quickSpecs:
    "grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 p-4 sm:grid-cols-4",
  quickSpec: "flex flex-col items-center text-center",
  quickSpecIcon: "mb-1 size-5 text-brand-600",
  quickSpecLabel: "text-xs text-gray-400",
  quickSpecValue: "text-sm font-semibold capitalize",
  ctaGrid: "grid grid-cols-1 gap-3 sm:grid-cols-3",
  ctaPrimary: "rounded-xl font-bold",
  ctaSecondary: "rounded-xl border-2 border-gray-200 hover:border-brand-400",
  secondaryActions: "flex flex-wrap items-center justify-between gap-2",
  ownerNote:
    "flex items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4",
  ownerNoteText: "text-sm text-brand-800",
  trustGrid: "grid grid-cols-2 gap-3 sm:grid-cols-4",
  trustItem: "flex flex-col items-center gap-1 text-center",
  trustIcon: "size-5 text-brand-600",
  trustTitle: "text-xs leading-tight font-semibold text-gray-700",
  trustSub: "text-[10px] leading-tight text-gray-400",
  sellerLink:
    "flex items-center gap-3 rounded-2xl border border-gray-100 p-4 hover:border-brand-400",
  sellerInfo: "flex-1",
  sellerNameRow: "flex items-center gap-1.5",
  sellerName: "font-semibold",
  sellerCaption: "text-xs text-gray-400",
  verifiedIcon: "size-4 text-brand-600",
  sellerArrow: "size-4 text-gray-400",
  tabBar: "mt-10 flex gap-8 overflow-x-auto border-b border-gray-100 text-sm font-medium",
  tabBase: "shrink-0 border-b-2 py-3 transition-colors",
  tabActive: "border-brand-500 text-brand-600",
  tabInactive: "border-transparent text-gray-500 hover:text-gray-700",
  tabContent: "grid grid-cols-1 gap-10 py-8 md:grid-cols-2",
  fullWidth: "col-span-full",
  sectionHeading: "mb-3 text-lg font-bold",
  description: "text-sm leading-relaxed whitespace-pre-line text-gray-600",
  emptyText: "text-sm text-gray-400",
  tagRow: "mt-4 flex flex-wrap gap-2",
  tag: "rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600",
  keyList: "space-y-2",
  keyRow: "flex justify-between gap-4 border-b border-gray-50 pb-2 text-sm",
  keyLabel: "flex items-center gap-2 text-gray-500",
  keyIcon: "size-4 text-gray-400",
  keyValue: "text-right font-medium capitalize",
  specGrid: "grid grid-cols-1 gap-3 sm:grid-cols-2",
  specCell:
    "flex justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 text-sm",
  specLabel: "text-gray-500",
  specValue: "text-right font-semibold capitalize",
};

// The mobile detail endpoint populates `seller` with ratingAvg (backend
// mobile.controller.js#getById), which isn't part of the generic
// Mobile['seller'] Pick in src/types/models.ts — extend locally instead of
// widening the shared model type (same convention as FeaturedSellers.tsx).
type PopulatedSeller = Pick<
  User,
  "_id" | "name" | "avatar" | "sellerProfile"
> & { ratingAvg?: number; ratingCount?: number };

const MobileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const isWishlisted = useAppSelector(selectIsWishlisted(id ?? ""));

  const [mobile, setMobile] = useState<Mobile | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Price history and reviews are secondary — a failure there shouldn't
    // block viewing the listing itself, so they're fetched independently
    // rather than as part of the same Promise.all the listing fetch is in.
    api
      .get<ApiResponse<PriceHistoryItem[]>>(`/mobiles/${id}/price-history`)
      .then(({ data }) => setPriceHistory(data.data))
      .catch(() => {});
    api
      .get<ApiResponse<Review[]>>(`/reviews/mobile/${id}`)
      .then(({ data }) => setReviews(data.data))
      .catch(() => {});

    api
      .get<ApiResponse<Mobile>>(`/mobiles/${id}`)
      .then(({ data }) => setMobile(data.data))
      .catch((err) => {
        const message =
          isAxiosError<{ message?: string }>(err) && err.response?.data?.message;
        toast.error(message || "Listing not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!mobile) return null;

  const seller =
    typeof mobile.seller === "string"
      ? undefined
      : (mobile.seller as PopulatedSeller);
  const isOwner = user?._id === seller?._id;
  const canEdit = isOwner && SELLER_EDITABLE_STATUSES.includes(mobile.status);

  const categoryLabel =
    DEVICE_CATEGORIES.find((c) => c.value === mobile.category)?.label ??
    mobile.category;
  const showStorageRam = STORAGE_RAM_CATEGORIES.includes(mobile.category);
  const showBattery =
    BATTERY_HEALTH_CATEGORIES.includes(mobile.category) &&
    mobile.batteryHealth != null;
  const discountPct =
    mobile.mrp && mobile.mrp > mobile.price
      ? Math.round(((mobile.mrp - mobile.price) / mobile.mrp) * 100)
      : 0;
  const reviewAvg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const subtitle = [
    showStorageRam && mobile.storage ? `${mobile.storage}GB` : null,
    showStorageRam && mobile.ram ? `${mobile.ram}GB RAM` : null,
    mobile.color,
  ]
    .filter(Boolean)
    .join(" · ");

  const quickSpecs = ([
    showStorageRam && mobile.storage
      ? { icon: HardDrive, label: "Storage", value: `${mobile.storage}GB` }
      : null,
    showStorageRam && mobile.ram
      ? { icon: Cpu, label: "RAM", value: `${mobile.ram}GB` }
      : null,
    mobile.color ? { icon: Palette, label: "Color", value: mobile.color } : null,
    { icon: Sparkles, label: "Condition", value: mobile.condition },
  ] as (SpecItem | null)[]).filter((s): s is SpecItem => s !== null);

  const keyDetails: SpecItem[] = [
    {
      icon: Box,
      label: "Original Box",
      value: mobile.originalBoxAvailable ? "Yes" : "No",
    },
    {
      icon: Zap,
      label: "Charger",
      value: mobile.chargerIncluded ? "Included" : "Not included",
    },
    {
      icon: Wrench,
      label: "Repairs",
      value: mobile.repairHistory?.length
        ? `${mobile.repairHistory.length} recorded`
        : "None recorded",
    },
    {
      icon: FileText,
      label: "Purchase Bill",
      value: mobile.purchaseBillUrl ? "Available" : "Not available",
    },
    ...(showBattery
      ? [
        {
          icon: Battery,
          label: "Battery Health",
          value: `${mobile.batteryHealth}%`,
        },
      ]
      : []),
    {
      icon: ShieldCheck,
      label: "Warranty",
      value: mobile.warranty?.hasWarranty ? "Yes" : "No",
    },
    ...(mobile.location?.city
      ? [
        {
          icon: MapPin,
          label: "Location",
          value: [mobile.location.city, mobile.location.state]
            .filter(Boolean)
            .join(", "),
        },
      ]
      : []),
  ];

  const fullSpecs: SpecItem[] = [
    { label: "Brand", value: mobile.brand },
    { label: "Model", value: mobile.model },
    { label: "Category", value: categoryLabel },
    ...quickSpecs.map(({ label, value }) => ({ label, value })),
    ...Object.entries(mobile.attributes ?? {})
      .filter(([, value]) => value)
      .map(([label, value]) => ({ label, value })),
    ...keyDetails.map(({ label, value }) => ({ label, value })),
  ];

  const tags = [
    ...new Set([
      ...(mobile.chargerIncluded ? ["Original Charger"] : []),
      ...(mobile.originalBoxAvailable ? ["Original Box"] : []),
      ...(!mobile.repairHistory?.length ? ["No Repairs"] : []),
      ...(mobile.imeiVerified ? ["IMEI Verified"] : []),
      ...(mobile.accessoriesIncluded ?? []),
    ]),
  ];

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "specifications", label: "Specifications" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
    { key: "priceHistory", label: "Price History" },
  ];

  const handleWishlist = () => {
    if (!isAuthenticated) return toast.error("Please login to save listings");
    dispatch(
      isWishlisted ? removeFromWishlist(mobile._id) : addToWishlist(mobile._id),
    );
  };

  const handleChatSeller = async () => {
    if (!isAuthenticated)
      return toast.error("Please login to chat with the seller");
    if (!seller) return;
    setChatLoading(true);
    try {
      const { data } = await api.post<ApiResponse<{ _id: string }>>(
        "/chat/conversations",
        { recipientId: seller._id, mobileId: mobile._id },
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
      <nav className={classes.breadcrumb}>
        <Link to={PATHS.home} className={classes.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight className={classes.breadcrumbSeparator} />
        <Link
          to={`${PATHS.search}?category=${mobile.category}`}
          className={classes.breadcrumbLink}
        >
          {categoryLabel}
        </Link>
        <ChevronRight className={classes.breadcrumbSeparator} />
        <Link
          to={`${PATHS.search}?category=${mobile.category}&brand=${encodeURIComponent(mobile.brand)}`}
          className={classes.breadcrumbLink}
        >
          {mobile.brand}
        </Link>
        <ChevronRight className={classes.breadcrumbSeparator} />
        <span className={classes.breadcrumbCurrent}>{mobile.model}</span>
      </nav>

      <div className={classes.mainGrid}>
        <ImageGallery
          images={mobile.images}
          videos={mobile.videos}
          overlay={
            <button
              onClick={handleWishlist}
              className={classes.wishlistButton}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={
                  isWishlisted
                    ? classes.wishlistIconActive
                    : classes.wishlistIconInactive
                }
              />
            </button>
          }
        />

        <div className={classes.details}>
          <div>
            <p className={classes.brand}>{mobile.brand}</p>
            <h1 className={classes.title}>{mobile.model}</h1>
            {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
          </div>

          <div className={classes.ratingRow}>
            <StarRating value={reviewAvg} />
            {reviews.length > 0 ? (
              <>
                <span className={classes.ratingValue}>
                  {reviewAvg.toFixed(1)}
                </span>
                <span className={classes.ratingCount}>
                  ({reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className={classes.ratingCount}>No reviews yet</span>
            )}
          </div>

          <div className={classes.badgeRow}>
            {showBattery && (
              <Badge
                variant="amber"
                icon={Battery}
                className={clsx(classes.pill, classes.pillAmber)}
              >
                {mobile.batteryHealth}% Battery
              </Badge>
            )}
            <Badge
              variant="green"
              icon={BadgeCheck}
              className={clsx(classes.pill, classes.pillGreen, "capitalize")}
            >
              {mobile.condition} Condition
            </Badge>
            {mobile.negotiable && (
              <Badge
                variant="brand"
                icon={HandCoins}
                className={clsx(classes.pill, classes.pillBrand)}
              >
                Negotiable
              </Badge>
            )}
            {mobile.imeiVerified && (
              <Badge
                variant="brand"
                icon={BadgeCheck}
                className={clsx(classes.pill, classes.pillBrand)}
              >
                IMEI Verified
              </Badge>
            )}
            {mobile.warranty?.hasWarranty && (
              <Badge
                variant="green"
                icon={ShieldCheck}
                className={clsx(classes.pill, classes.pillGreen)}
              >
                Under Warranty
              </Badge>
            )}
          </div>

          <div className={classes.priceRow}>
            <span className={classes.price}>
              {formatCurrency(mobile.price)}
            </span>
            {mobile.mrp && mobile.mrp > mobile.price && (
              <span className={classes.mrp}>{formatCurrency(mobile.mrp)}</span>
            )}
            {discountPct > 0 && (
              <span className={classes.discount}>{discountPct}% OFF</span>
            )}
          </div>

          <div className={classes.quickSpecs}>
            {quickSpecs.map(({ icon: Icon, label, value }) => (
              <div key={label} className={classes.quickSpec}>
                {Icon && <Icon className={classes.quickSpecIcon} />}
                <span className={classes.quickSpecLabel}>{label}</span>
                <span className={classes.quickSpecValue}>{value}</span>
              </div>
            ))}
          </div>

          {isOwner ? (
            <div className={classes.ownerNote}>
              <span className={classes.ownerNoteText}>
                {canEdit
                  ? "This is your listing. You can edit it until an admin approves it."
                  : "This is your listing. It has been approved, so it can no longer be edited."}
              </span>
              {canEdit && (
                <Link to={PATHS.editListing(mobile._id)}>
                  <Button variant="secondary" icon={Pencil}>
                    Edit Listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className={classes.ctaGrid}>
                <Button
                  size="lg"
                  icon={ShoppingCart}
                  className={clsx(
                    classes.ctaPrimary,
                    !mobile.negotiable && "sm:col-span-2",
                  )}
                  onClick={() => navigate(PATHS.checkout(mobile._id))}
                  disabled={isAdmin}
                >
                  Buy Now
                </Button>
                {mobile.negotiable && (
                  <Button
                    size="lg"
                    variant="secondary"
                    icon={HandCoins}
                    className={classes.ctaSecondary}
                    onClick={() =>
                      isAuthenticated
                        ? setNegotiateOpen(true)
                        : toast.error("Please login to negotiate")
                    }
                  >
                    Negotiate
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="secondary"
                  icon={MessageCircle}
                  className={classes.ctaSecondary}
                  loading={chatLoading}
                  onClick={handleChatSeller}
                >
                  Chat Seller
                </Button>
              </div>
              <div className={classes.secondaryActions}>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={GitCompareArrows}
                  onClick={() =>
                    navigate(`${PATHS.compare}?ids=${mobile._id}`)
                  }
                >
                  Compare
                </Button>
                <ReportButton
                  reportType="listing"
                  targetId={mobile._id}
                  label="Report this listing"
                />
              </div>
            </>
          )}

          <div className={classes.trustGrid}>
            {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
              <div key={title} className={classes.trustItem}>
                <Icon className={classes.trustIcon} />
                <span className={classes.trustTitle}>{title}</span>
                <span className={classes.trustSub}>{sub}</span>
              </div>
            ))}
          </div>

          <Link to={`/users/${seller?._id}`} className={classes.sellerLink}>
            <Avatar src={seller?.avatar} name={seller?.name} size="md" />
            <div className={classes.sellerInfo}>
              <div className={classes.sellerNameRow}>
                <span className={classes.sellerName}>{seller?.name}</span>
                {seller?.sellerProfile?.isVerified && (
                  <BadgeCheck className={classes.verifiedIcon} />
                )}
              </div>
              <StarRating value={seller?.ratingAvg} />
              <span className={classes.sellerCaption}>View seller profile</span>
            </div>
            <ChevronRight className={classes.sellerArrow} />
          </Link>
        </div>
      </div>

      <div className={classes.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              classes.tabBase,
              activeTab === tab.key ? classes.tabActive : classes.tabInactive,
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={activeTab} className={clsx(classes.tabContent, "animate-fade-up")}>
        {activeTab === "description" && (
          <>
            <div>
              <h2 className={classes.sectionHeading}>About this item</h2>
              {mobile.description ? (
                <p className={classes.description}>{mobile.description}</p>
              ) : (
                <p className={classes.emptyText}>
                  The seller has not added a description.
                </p>
              )}
              {tags.length > 0 && (
                <div className={classes.tagRow}>
                  {tags.map((tag) => (
                    <span key={tag} className={classes.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h2 className={classes.sectionHeading}>Key Details</h2>
              <div className={classes.keyList}>
                {keyDetails.map(({ icon: Icon, label, value }) => (
                  <div key={label} className={classes.keyRow}>
                    <span className={classes.keyLabel}>
                      {Icon && <Icon className={classes.keyIcon} />}
                      {label}
                    </span>
                    <span className={classes.keyValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "specifications" && (
          <div className={classes.fullWidth}>
            <h2 className={classes.sectionHeading}>Full Specifications</h2>
            <div className={classes.specGrid}>
              {fullSpecs.map(({ label, value }, idx) => (
                <div key={`${label}-${idx}`} className={classes.specCell}>
                  <span className={classes.specLabel}>{label}</span>
                  <span className={classes.specValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className={classes.fullWidth}>
            <h2 className={classes.sectionHeading}>Customer Reviews</h2>
            <ReviewList reviews={reviews} />
          </div>
        )}

        {activeTab === "priceHistory" && (
          <div className={classes.fullWidth}>
            <h2 className={classes.sectionHeading}>Price History</h2>
            <PriceHistoryChart history={priceHistory} />
          </div>
        )}
      </div>

      <NegotiateModal
        open={negotiateOpen}
        onClose={() => setNegotiateOpen(false)}
        mobile={mobile}
      />
    </div>
  );
};

export default MobileDetail;
