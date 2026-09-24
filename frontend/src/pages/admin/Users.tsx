import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  Users as UsersIcon,
  ShoppingBag,
  Store,
  UserCheck,
  UserX,
  Eye,
  Ban,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import api from "../../api/api";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Pagination from "../../components/common/Pagination";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import type {
  Role,
  SellerProfile,
  User,
  VerificationStatus,
} from "../../types/models";
import type { ApiResponse, PaginationMeta } from "../../types/api";

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? "Something went wrong")
    : "Something went wrong";

interface UserFilters {
  role: Role | "";
  isBlocked: "" | "true" | "false";
  q: string;
}

const TABS = ["all", "buyer", "seller", "active", "suspended"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  all: "All",
  buyer: "Buyers",
  seller: "Sellers",
  active: "Active",
  suspended: "Suspended",
};

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
  tableWrapper: "overflow-x-auto",
  table: "w-full min-w-[760px] text-sm",
  thead: "border-y border-gray-100 bg-gray-50 text-left text-xs text-gray-500",
  th: "p-3 font-medium",
  tbody: "divide-y divide-gray-50",
  td: "p-3",
  userCell: "flex items-center gap-3",
  userName: "text-sm font-medium",
  userEmail: "text-xs text-gray-400",
  verificationWrap: "flex items-center gap-2",
  verificationCell: "space-y-1",
  docLinks: "flex flex-wrap gap-x-2 gap-y-0.5",
  docLink: "text-[11px] font-medium text-brand-700 underline hover:text-brand-800",
  verificationActions: "flex gap-1",
  approveLink: "text-xs text-green-600 hover:underline",
  rejectLink: "text-xs text-red-600 hover:underline",
  actionsCell: "flex items-center gap-2",
  iconButton:
    "flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50",
  iconButtonDanger: "hover:text-red-600 hover:border-red-200",
  iconButtonSuccess: "hover:text-green-600 hover:border-green-200",
  blockButton: "mt-4 w-full",
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [counts, setCounts] = useState({
    all: 0,
    buyer: 0,
    seller: 0,
    active: 0,
    suspended: 0,
  });
  const [tab, setTab] = useState<Tab>("all");
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    isBlocked: "",
    q: "",
  });
  const debouncedQ = useDebounce(filters.q, 400);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const tabParams = (t: Tab): { role?: Role; isBlocked?: boolean } => {
    if (t === "buyer") return { role: "buyer" };
    if (t === "seller") return { role: "seller" };
    if (t === "active") return { isBlocked: false };
    if (t === "suspended") return { isBlocked: true };
    return {};
  };

  const load = () => {
    setLoading(true);
    const { role, isBlocked } = tabParams(tab);
    api
      .get<ApiResponse<User[]>>("/users", {
        params: {
          page,
          role: filters.role || role,
          isBlocked: filters.isBlocked
            ? filters.isBlocked === "true"
            : isBlocked,
          q: debouncedQ || undefined,
        },
      })
      .then(({ data }) => {
        setUsers(data.data);
        setMeta(data.meta);
      })
      .catch((err) => {
        const message =
          isAxiosError<{ message?: string }>(err) && err.response?.data?.message;
        toast.error(message || "Failed to load users");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, tab, filters.role, filters.isBlocked, debouncedQ]);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<User[]>>("/users", { params: { limit: 1 } }),
      api.get<ApiResponse<User[]>>("/users", {
        params: { limit: 1, role: "buyer" },
      }),
      api.get<ApiResponse<User[]>>("/users", {
        params: { limit: 1, role: "seller" },
      }),
      api.get<ApiResponse<User[]>>("/users", {
        params: { limit: 1, isBlocked: false },
      }),
      api.get<ApiResponse<User[]>>("/users", {
        params: { limit: 1, isBlocked: true },
      }),
    ])
      .then(([all, buyers, sellers, active, suspended]) => {
        setCounts({
          all: all.data.meta?.total || 0,
          buyer: buyers.data.meta?.total || 0,
          seller: sellers.data.meta?.total || 0,
          active: active.data.meta?.total || 0,
          suspended: suspended.data.meta?.total || 0,
        });
      })
      .catch(() => {});
  }, [tab, filters.role, filters.isBlocked, debouncedQ]);

  const resetFilters = () => {
    setFilters({ role: "", isBlocked: "", q: "" });
    setTab("all");
    setPage(1);
  };

  const handleBlock = async () => {
    if (!blockTarget) return;
    try {
      await api.patch(`/users/${blockTarget._id}/block`, {
        reason: blockReason,
      });
      toast.success("User blocked");
      setBlockTarget(null);
      setBlockReason("");
      load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleUnblock = async (id: string) => {
    await api.patch(`/users/${id}/unblock`);
    toast.success("User unblocked");
    load();
  };

  const handleVerification = async (
    id: string,
    status: Extract<VerificationStatus, "approved" | "rejected">,
  ) => {
    try {
      await api.patch(`/users/${id}/seller-verification`, {
        status,
        rejectionReason:
          status === "rejected"
            ? "Documents did not meet requirements"
            : undefined,
      });
      toast.success(`Seller ${status}`);
      load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  // Uploaded seller verification photos, so the admin can check them before
  // approving.
  const verificationDocs = (docs: SellerProfile["documents"]) =>
    [
      { label: "Aadhaar", url: docs?.aadhaarUrl },
      { label: "PAN", url: docs?.panUrl },
      { label: "Selfie", url: docs?.selfieUrl },
      { label: "Bill", url: docs?.purchaseBillUrl },
    ].filter((d): d is { label: string; url: string } => Boolean(d.url));

  const pct = (n: number) =>
    counts.all > 0 ? `${Math.round((n / counts.all) * 100)}% of total` : "—";

  return (
    <div>
      <div className={classes.headerRow}>
        <h2 className={classes.title}>Users</h2>
        <p className={classes.subtitle}>
          Manage all registered users on your marketplace.
        </p>
      </div>

      <div className={classes.statGrid}>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-green-50`}>
            <UsersIcon className="size-5 text-green-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Total Users</p>
            <p className={classes.statValue}>{counts.all}</p>
            <p className={classes.statCaption}>All roles</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-blue-50`}>
            <ShoppingBag className="size-5 text-blue-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Buyers</p>
            <p className={classes.statValue}>{counts.buyer}</p>
            <p className={classes.statCaption}>{pct(counts.buyer)}</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-purple-50`}>
            <Store className="size-5 text-purple-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Sellers</p>
            <p className={classes.statValue}>{counts.seller}</p>
            <p className={classes.statCaption}>{pct(counts.seller)}</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-emerald-50`}>
            <UserCheck className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className={classes.statLabel}>Active</p>
            <p className={classes.statValue}>{counts.active}</p>
            <p className={classes.statCaption}>{pct(counts.active)}</p>
          </div>
        </div>
        <div className={classes.statCard}>
          <div className={`${classes.statIconWrap} bg-red-50`}>
            <UserX className="size-5 text-red-500" />
          </div>
          <div>
            <p className={classes.statLabel}>Suspended</p>
            <p className={classes.statValue}>{counts.suspended}</p>
            <p className={classes.statCaption}>{pct(counts.suspended)}</p>
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
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>

        <div className={classes.filterRow}>
          <div className={classes.searchWrap}>
            <Input
              placeholder="Search users by name, email..."
              value={filters.q}
              onChange={(e) => {
                setFilters({ ...filters, q: e.target.value });
                setPage(1);
              }}
            />
          </div>
          <Button variant="secondary" icon={RotateCcw} onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {loading ? (
          <Spinner full />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="No users match this filter."
          />
        ) : (
          <div className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead className={classes.thead}>
                <tr>
                  <th className={classes.th}>User</th>
                  <th className={classes.th}>Role</th>
                  <th className={classes.th}>Verification</th>
                  <th className={classes.th}>Joined</th>
                  <th className={classes.th}>Status</th>
                  <th className={classes.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={classes.tbody}>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className={classes.td}>
                      <div className={classes.userCell}>
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <div>
                          <p className={classes.userName}>{u.name}</p>
                          <p className={classes.userEmail}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={classes.td}>
                      <Badge variant={u.role === "seller" ? "green" : "brand"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className={classes.td}>
                      {u.role === "seller" && (
                        <div className={classes.verificationCell}>
                          <div className={classes.verificationWrap}>
                            <Badge
                              variant={
                                u.sellerProfile?.verificationStatus === "approved"
                                  ? "green"
                                  : u.sellerProfile?.verificationStatus ===
                                      "pending"
                                    ? "amber"
                                    : "gray"
                              }
                            >
                              {u.sellerProfile?.verificationStatus}
                            </Badge>
                            {u.sellerProfile?.verificationStatus === "pending" && (
                              <div className={classes.verificationActions}>
                                <button
                                  onClick={() =>
                                    handleVerification(u._id, "approved")
                                  }
                                  className={classes.approveLink}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerification(u._id, "rejected")
                                  }
                                  className={classes.rejectLink}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                          {verificationDocs(u.sellerProfile?.documents).length >
                            0 && (
                            <div className={classes.docLinks}>
                              {verificationDocs(u.sellerProfile?.documents).map(
                                (doc) => (
                                  <a
                                    key={doc.label}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={classes.docLink}
                                  >
                                    {doc.label}
                                  </a>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className={classes.td}>{formatDate(u.createdAt)}</td>
                    <td className={classes.td}>
                      <Badge variant={u.isBlocked ? "red" : "green"}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </td>
                    <td className={classes.td}>
                      <div className={classes.actionsCell}>
                        <Link
                          to={`/users/${u._id}`}
                          className={classes.iconButton}
                          aria-label="View profile"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        {u.isBlocked ? (
                          <button
                            onClick={() => handleUnblock(u._id)}
                            className={`${classes.iconButton} ${classes.iconButtonSuccess}`}
                            aria-label="Unblock"
                          >
                            <ShieldCheck className="size-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setBlockTarget(u)}
                            className={`${classes.iconButton} ${classes.iconButtonDanger}`}
                            aria-label="Block"
                          >
                            <Ban className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <Modal
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        title={`Block ${blockTarget?.name}?`}
      >
        <Textarea
          label="Reason"
          required
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
        />
        <Button
          variant="danger"
          className={classes.blockButton}
          onClick={handleBlock}
          disabled={!blockReason}
        >
          Block User
        </Button>
      </Modal>
    </div>
  );
};

export default Users;
