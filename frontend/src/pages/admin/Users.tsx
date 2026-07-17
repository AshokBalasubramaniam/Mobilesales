import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "../../api/api";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Pagination from "../../components/common/Pagination";
import Spinner from "../../components/common/Spinner";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/format";
import type { Role, User, VerificationStatus } from "../../types/models";
import type { ApiResponse, PaginationMeta } from "../../types/api";

interface UserFilters {
  role: Role | "";
  isBlocked: "" | "true" | "false";
  q: string;
}

const classes = {
  title: "mb-4 text-lg font-semibold",
  filterBar: "mb-4 flex flex-wrap gap-2",
  searchInput: "max-w-xs",
  roleSelect: "w-36",
  statusSelect: "w-36",
  tableWrapper:
    "overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800",
  table: "w-full min-w-[700px] text-sm",
  thead:
    "bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-900",
  th: "p-3",
  tbody: "divide-y divide-gray-100 dark:divide-gray-800",
  userCell: "flex items-center gap-2 p-3",
  userName: "font-medium",
  userEmail: "text-xs text-gray-400",
  td: "p-3",
  roleCell: "p-3 capitalize",
  verificationWrap: "flex items-center gap-2",
  verificationActions: "flex gap-1",
  approveLink: "text-xs text-green-600 hover:underline",
  rejectLink: "text-xs text-red-600 hover:underline",
  dateCell: "p-3 text-gray-500",
  blockButton: "mt-4 w-full",
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
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

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<User[]>>("/users", {
        params: {
          page,
          role: filters.role || undefined,
          isBlocked: filters.isBlocked || undefined,
          q: debouncedQ || undefined,
        },
      })
      .then(({ data }) => {
        setUsers(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, filters.role, filters.isBlocked, debouncedQ]);

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
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not block user",
      );
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
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not update verification",
      );
    }
  };

  return (
    <div>
      <h2 className={classes.title}>User Management</h2>

      <div className={classes.filterBar}>
        <Input
          placeholder="Search name, email, phone..."
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          className={classes.searchInput}
        />
        <Select
          value={filters.role}
          onChange={(e) =>
            setFilters({ ...filters, role: e.target.value as Role | "" })
          }
          className={classes.roleSelect}
        >
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          value={filters.isBlocked}
          onChange={(e) =>
            setFilters({
              ...filters,
              isBlocked: e.target.value as UserFilters["isBlocked"],
            })
          }
          className={classes.statusSelect}
        >
          <option value="">All statuses</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </Select>
      </div>

      {loading ? (
        <Spinner full />
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
                  <td className={classes.userCell}>
                    <Avatar src={u.avatar} name={u.name} size="sm" />
                    <div>
                      <p className={classes.userName}>{u.name}</p>
                      <p className={classes.userEmail}>{u.email}</p>
                    </div>
                  </td>
                  <td className={classes.roleCell}>{u.role}</td>
                  <td className={classes.td}>
                    {u.role === "seller" && (
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
                    )}
                  </td>
                  <td className={classes.dateCell}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td className={classes.td}>
                    <Badge variant={u.isBlocked ? "red" : "green"}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </td>
                  <td className={classes.td}>
                    {u.isBlocked ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUnblock(u._id)}
                      >
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setBlockTarget(u)}
                      >
                        Block
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />

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
