import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Eye,
  Pencil,
  RotateCcw,
  Search,
} from "lucide-react";
import api from "../../api/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { formatCurrency, formatDate } from "../../utils/format";
import { MOBILE_CONDITIONS, DEVICE_CATEGORIES } from "../../utils/constants";
import { PATHS } from "../../routes/paths";
import type { Mobile, MobileStatus, User } from "../../types/models";
import type { ApiResponse, PaginationMeta } from "../../types/api";

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? "Something went wrong")
    : "Something went wrong";

const STATUS_DOT: Record<MobileStatus, string> = {
  draft: "bg-gray-400",
  active: "bg-green-500",
  pending_approval: "bg-amber-500",
  rejected: "bg-red-500",
  sold: "bg-brand-500",
  removed: "bg-gray-400",
};
const STATUS_LABEL: Record<MobileStatus, string> = {
  draft: "Draft",
  active: "Live",
  pending_approval: "Pending Approval",
  rejected: "Rejected",
  sold: "Sold",
  removed: "Removed",
};
const CATEGORY_LABEL = Object.fromEntries(
  DEVICE_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<string, string>;

const TABS = [
  "all",
  "active",
  "pending_approval",
  "sold",
  "rejected",
  "removed",
] as const;
type Tab = (typeof TABS)[number];

interface Filters {
  category: string;
  seller: string;
  q: string;
}

interface EditForm {
  price: string;
  mrp: string;
  negotiable: boolean;
  condition: Mobile["condition"];
  batteryHealth: number;
  description: string;
}

const classes = {
  headerRow: "mb-4",
  title: "text-lg font-semibold",
  subtitle: "text-sm text-gray-500",
  statGrid: "mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5",
  statCard:
    "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm",
  statIconWrap: "flex size-10 shrink-0 items-center justify-center rounded-xl",
  statLabel: "text-xs text-gray-500",
  statValue: "text-xl font-bold text-gray-900",
  statCaption: "text-[11px] text-gray-400",
  card: "rounded-2xl border border-gray-100 bg-white shadow-sm",
  tabsRow: "flex gap-2 overflow-x-auto border-b border-gray-100 px-4 pt-4 pb-3",
  tabButtonBase: "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium",
  tabButtonActive: "bg-brand-600 text-white",
  tabButtonInactive: "bg-gray-100 text-gray-600",
  filterRow: "flex flex-wrap items-end gap-2 px-4 py-3",
  searchWrap: "min-w-[220px] flex-1",
  categorySelect: "w-40",
  sellerSelect: "w-44",
  sortSelect: "w-36",
  tableWrapper: "overflow-x-auto",
  table: "w-full min-w-[860px] text-sm",
  thead: "border-y border-gray-100 bg-gray-50 text-left text-xs text-gray-500",
  th: "p-3 font-medium",
  tbody: "divide-y divide-gray-50",
  td: "p-3",
  productCell: "flex items-center gap-3",
  productImage: "size-11 rounded-lg bg-gray-100 object-cover",
  productName: "font-semibold hover:text-brand-600",
  productSub: "text-xs text-gray-400",
  sellerCell: "flex items-center gap-2",
  sellerAvatar:
    "flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700",
  sellerName: "text-sm font-medium",
  sellerEmail: "text-xs text-gray-400",
  statusCell: "flex items-center gap-1.5",
  statusDot: "size-1.5 rounded-full",
  actionsCell: "flex items-center gap-2",
  iconButton:
    "flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50",
  form: "space-y-4",
  priceGrid: "grid grid-cols-2 gap-4",
  batteryLabel: "mb-1.5 text-sm font-medium text-gray-700",
  batterySlider: "w-full accent-brand-600",
  negotiableLabel: "flex items-center gap-2 text-sm",
  submitButton: "mt-2 w-full",
};

const Products = () => {
  const [listings, setListings] = useState<Mobile[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [counts, setCounts] = useState<Record<"all" | MobileStatus, number>>({
    all: 0,
    draft: 0,
    active: 0,
    pending_approval: 0,
    rejected: 0,
    sold: 0,
    removed: 0,
  });
  const [searchParams] = useSearchParams();
  const [sellers, setSellers] = useState<User[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [filters, setFilters] = useState<Filters>({
    category: "",
    seller: "",
    q: searchParams.get("q") || "",
  });
  const debouncedQ = useDebounce(filters.q, 400);
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">(
    "newest",
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Mobile | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Mobile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Mobile[]>>("/mobiles/admin", {
        params: {
          page,
          status: tab === "all" ? undefined : tab,
          category: filters.category || undefined,
          seller: filters.seller || undefined,
          q: debouncedQ || undefined,
          sort,
        },
      })
      .then(({ data }) => {
        setListings(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, tab, filters.category, filters.seller, debouncedQ, sort]);

  useEffect(() => {
    api
      .get<ApiResponse<User[]>>("/users", { params: { role: "seller", limit: 100 } })
      .then(({ data }) => setSellers(data.data));
  }, []);

  useEffect(() => {
    Promise.all(
      (["all", "active", "pending_approval", "rejected", "removed"] as const).map(
        (s) =>
          api.get<ApiResponse<Mobile[]>>("/mobiles/admin", {
            params: { limit: 1, status: s === "all" ? undefined : s },
          }),
      ),
    ).then(([all, active, pending, rejected, removed]) => {
      setCounts((prev) => ({
        ...prev,
        all: all.data.meta?.total || 0,
        active: active.data.meta?.total || 0,
        pending_approval: pending.data.meta?.total || 0,
        rejected: rejected.data.meta?.total || 0,
        removed: removed.data.meta?.total || 0,
      }));
    });
  }, [tab, filters.category, filters.seller, debouncedQ]);

  const resetFilters = () => {
    setFilters({ category: "", seller: "", q: "" });
    setSort("newest");
    setTab("all");
    setPage(1);
  };

  const openEdit = (mobile: Mobile) => {
    setEditTarget(mobile);
    setEditForm({
      price: String(mobile.price),
      mrp: mobile.mrp ? String(mobile.mrp) : "",
      negotiable: mobile.negotiable,
      condition: mobile.condition,
      batteryHealth: mobile.batteryHealth ?? 80,
      description: mobile.description || "",
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm) return;
    setSaving(true);
    try {
      await api.patch(`/mobiles/${editTarget._id}`, {
        price: Number(editForm.price),
        mrp: editForm.mrp ? Number(editForm.mrp) : undefined,
        negotiable: editForm.negotiable,
        condition: editForm.condition,
        batteryHealth: Number(editForm.batteryHealth),
        description: editForm.description,
      });
      toast.success("Listing updated");
      setEditTarget(null);
      setEditForm(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/mobiles/${deleteTarget._id}`);
      toast.success("Listing removed");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const pct = (n: number) =>
    counts.all > 0 ? `${Math.round((n / counts.all) * 100)}% of total` : "—";

  return (
    <div>
      <div className={classes.headerRow}>
        <h2 className={classes.title}>Products</h2>
        <p className={classes.subtitle}>
          Manage all products listed on your marketplace.
        </p>
      </div>

      <div className={classes.statGrid}>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-green-50`}>
            <Package className="size-5 text-green-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Total Products</p>
            <p className={classes.statValue}>{counts.all}</p>
            <p className={classes.statCaption}>All statuses</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-green-50`}>
            <CheckCircle2 className="size-5 text-green-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Live Products</p>
            <p className={classes.statValue}>{counts.active}</p>
            <p className={classes.statCaption}>{pct(counts.active)}</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-amber-50`}>
            <Clock className="size-5 text-amber-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Pending Approval</p>
            <p className={classes.statValue}>{counts.pending_approval}</p>
            <p className={classes.statCaption}>{pct(counts.pending_approval)}</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-red-50`}>
            <XCircle className="size-5 text-red-500" />
          </div>
          <div>
            <p className={classes.statLabel}>Rejected</p>
            <p className={classes.statValue}>{counts.rejected}</p>
            <p className={classes.statCaption}>{pct(counts.rejected)}</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-gray-100`}>
            <Trash2 className="size-5 text-gray-500" />
          </div>
          <div>
            <p className={classes.statLabel}>Removed</p>
            <p className={classes.statValue}>{counts.removed}</p>
            <p className={classes.statCaption}>{pct(counts.removed)}</p>
          </div>
        </div>
      </div>

      <div className={classes.card}>
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

        <div className={classes.filterRow}>
          <div className={classes.searchWrap}>
            <Input
              icon={Search}
              placeholder="Search products by name..."
              value={filters.q}
              onChange={(e) => {
                setFilters({ ...filters, q: e.target.value });
                setPage(1);
              }}
            />
          </div>
          <Select
            className={classes.categorySelect}
            value={filters.category}
            onChange={(e) => {
              setFilters({ ...filters, category: e.target.value });
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {DEVICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select
            className={classes.sellerSelect}
            value={filters.seller}
            onChange={(e) => {
              setFilters({ ...filters, seller: e.target.value });
              setPage(1);
            }}
          >
            <option value="">All Sellers</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select
            className={classes.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="newest">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>
          <Button variant="secondary" icon={RotateCcw} onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {loading ? (
          <Spinner full />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="No listings match this filter."
          />
        ) : (
          <div className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead className={classes.thead}>
                <tr>
                  <th className={classes.th}>Product</th>
                  <th className={classes.th}>Price</th>
                  <th className={classes.th}>Seller</th>
                  <th className={classes.th}>Status</th>
                  <th className={classes.th}>Listed On</th>
                  <th className={classes.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={classes.tbody}>
                {listings.map((mobile) => {
                  const seller =
                    typeof mobile.seller === "string"
                      ? null
                      : (mobile.seller as { name?: string; email?: string });
                  return (
                    <tr key={mobile._id}>
                      <td className={classes.td}>
                        <div className={classes.productCell}>
                          <img
                            src={mobile.images?.[0]?.url}
                            alt=""
                            className={classes.productImage}
                          />
                          <div>
                            <Link
                              to={PATHS.mobileDetail(mobile._id)}
                              className={classes.productName}
                            >
                              {mobile.brand} {mobile.model}
                            </Link>
                            <p className={classes.productSub}>
                              {CATEGORY_LABEL[mobile.category] || mobile.category}
                              {" > "}
                              {mobile.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={classes.td}>
                        {formatCurrency(mobile.price)}
                      </td>
                      <td className={classes.td}>
                        <div className={classes.sellerCell}>
                          <span className={classes.sellerAvatar}>
                            {seller?.name?.slice(0, 2).toUpperCase() || "?"}
                          </span>
                          <div>
                            <p className={classes.sellerName}>{seller?.name}</p>
                            <p className={classes.sellerEmail}>{seller?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={classes.td}>
                        <span className={classes.statusCell}>
                          <span
                            className={`${classes.statusDot} ${STATUS_DOT[mobile.status]}`}
                          />
                          {STATUS_LABEL[mobile.status]}
                        </span>
                      </td>
                      <td className={classes.td}>
                        {formatDate(mobile.createdAt)}
                      </td>
                      <td className={classes.td}>
                        <div className={classes.actionsCell}>
                          <Link
                            to={PATHS.mobileDetail(mobile._id)}
                            className={classes.iconButton}
                            aria-label="View"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                          <button
                            onClick={() => openEdit(mobile)}
                            className={classes.iconButton}
                            aria-label="Edit"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(mobile)}
                            className={classes.iconButton}
                            aria-label="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => {
          setEditTarget(null);
          setEditForm(null);
        }}
        title={
          editTarget ? `Edit ${editTarget.brand} ${editTarget.model}` : ""
        }
      >
        {editForm && (
          <form onSubmit={handleSave} className={classes.form}>
            <div className={classes.priceGrid}>
              <Input
                label="Price (₹)"
                type="number"
                required
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
              />
              <Input
                label="MRP (₹)"
                type="number"
                value={editForm.mrp}
                onChange={(e) =>
                  setEditForm({ ...editForm, mrp: e.target.value })
                }
              />
            </div>
            <Select
              label="Condition"
              value={editForm.condition}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  condition: e.target.value as EditForm["condition"],
                })
              }
            >
              {MOBILE_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
            <div>
              <p className={classes.batteryLabel}>
                Battery health: {editForm.batteryHealth}%
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={editForm.batteryHealth}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    batteryHealth: Number(e.target.value),
                  })
                }
                className={classes.batterySlider}
              />
            </div>
            <label className={classes.negotiableLabel}>
              <input
                type="checkbox"
                checked={editForm.negotiable}
                onChange={(e) =>
                  setEditForm({ ...editForm, negotiable: e.target.checked })
                }
              />
              Open to negotiation
            </label>
            <Textarea
              label="Description"
              rows={4}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
            <Button
              type="submit"
              loading={saving}
              className={classes.submitButton}
            >
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove this listing?"
        description="This will remove the listing from the marketplace. This action cannot be undone."
        confirmLabel="Remove"
      />
    </div>
  );
};

export default Products;
