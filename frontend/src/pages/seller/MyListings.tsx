import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Heart, ListChecks, Pencil, Plus } from "lucide-react";
import api from "../../api/api";
import Badge from "../../components/common/Badge";
import type { BadgeProps } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { formatCurrency } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { ApiResponse, PaginationMeta } from "../../types/api";
import type { Mobile, MobileStatus } from "../../types/models";

const STATUS_VARIANT: Record<
  MobileStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  draft: "gray",
  active: "green",
  pending_approval: "amber",
  rejected: "red",
  sold: "brand",
  removed: "gray",
};
const STATUS_LABEL: Record<MobileStatus, string> = {
  draft: "Draft",
  active: "Live",
  pending_approval: "Pending Approval",
  rejected: "Rejected",
  sold: "Sold",
  removed: "Removed",
};

const TABS = ["all", "active", "pending_approval", "sold", "rejected"] as const;
type Tab = (typeof TABS)[number];

const classes = {
  headerRow: "mb-4 flex items-center justify-between",
  title: "text-lg font-semibold",
  tabsRow: "mb-4 flex gap-2 overflow-x-auto",
  tabButtonBase: "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium",
  tabButtonActive: "bg-brand-600 text-white",
  tabButtonInactive:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  listingsList: "space-y-3",
  listingCard:
    "flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800",
  listingImage: "size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800",
  listingInfo: "min-w-0 flex-1",
  listingLink: "truncate font-semibold hover:text-brand-600",
  listingPrice: "text-sm text-gray-500",
  rejectionReason: "mt-1 text-xs text-red-500",
  statsRow: "mt-1 flex items-center gap-3 text-xs text-gray-400",
  statItem: "flex items-center gap-1",
  statIcon: "size-3.5",
};

const MyListings = () => {
  const [listings, setListings] = useState<Mobile[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<Mobile[]>>("/mobiles/mine", {
        params: { page, status: tab === "all" ? undefined : tab },
      })
      .then(({ data }) => {
        setListings(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, tab]);

  return (
    <div>
      <div className={classes.headerRow}>
        <h2 className={classes.title}>My Listings</h2>
        <Link to={PATHS.sell}>
          <Button size="sm" icon={Plus}>
            New Listing
          </Button>
        </Link>
      </div>

      <div className={classes.tabsRow}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`${classes.tabButtonBase} ${tab === t ? classes.tabButtonActive : classes.tabButtonInactive}`}
          >
            {t === "all" ? "All" : STATUS_LABEL[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner full />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No listings here"
          description="Create a new listing to get started."
        />
      ) : (
        <div className={classes.listingsList}>
          {listings.map((mobile) => (
            <div key={mobile._id} className={classes.listingCard}>
              <img
                src={mobile.images?.[0]?.url}
                alt=""
                className={classes.listingImage}
              />
              <div className={classes.listingInfo}>
                <Link
                  to={PATHS.mobileDetail(mobile._id)}
                  className={classes.listingLink}
                >
                  {mobile.brand} {mobile.model}
                </Link>
                <p className={classes.listingPrice}>
                  {formatCurrency(mobile.price)}
                </p>
                {mobile.status === "rejected" && mobile.rejectionReason && (
                  <p className={classes.rejectionReason}>
                    Reason: {mobile.rejectionReason}
                  </p>
                )}
                <div className={classes.statsRow}>
                  <span className={classes.statItem}>
                    <Eye className={classes.statIcon} /> {mobile.views}
                  </span>
                  <span className={classes.statItem}>
                    <Heart className={classes.statIcon} /> {mobile.likesCount}
                  </span>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[mobile.status]}>
                {STATUS_LABEL[mobile.status]}
              </Badge>
              {mobile.status !== "sold" && (
                <Link to={PATHS.editListing(mobile._id)}>
                  <Button size="sm" variant="secondary" icon={Pencil}>
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default MyListings;
