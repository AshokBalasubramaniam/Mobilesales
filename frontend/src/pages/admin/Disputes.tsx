import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Gavel } from "lucide-react";
import api from "../../api/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { formatCurrency, formatDate } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type {
  Dispute,
  DisputeStatus,
  Order,
  OrderPricing,
} from "../../types/models";
import type { ApiResponse, PaginationMeta } from "../../types/api";
import type { BadgeProps } from "../../components/common/Badge";

const STATUS_VARIANT: Record<
  DisputeStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  open: "amber",
  in_review: "brand",
  resolved: "green",
  rejected: "red",
};

const classes = {
  heading: "mb-4 text-lg font-semibold",
  list: "space-y-3",
  card: "rounded-xl border border-gray-200 p-4",
  cardHeader: "flex items-start justify-between",
  orderLink: "font-medium hover:text-brand-600",
  reason: "text-sm text-gray-500",
  description: "mt-1 text-sm text-gray-400",
  createdAt: "mt-1 text-xs text-gray-400",
  resolveButton: "mt-3",
  modalActions: "mt-4 flex gap-2",
  modalActionButton: "flex-1",
};

const Disputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resolveTarget, setResolveTarget] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Dispute[]>>("/reports/disputes", { params: { page } })
      .then(({ data }) => {
        setDisputes(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleResolve = async (status: "resolved" | "rejected") => {
    if (!resolveTarget) return;
    try {
      await api.patch(`/reports/disputes/${resolveTarget._id}/resolve`, {
        status,
        resolution,
      });
      toast.success("Dispute updated");
      setResolveTarget(null);
      setResolution("");
      load();
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not update dispute",
      );
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className={classes.heading}>Disputes</h2>

      {disputes.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No disputes"
          description="No buyer/seller disputes to resolve."
        />
      ) : (
        <div className={classes.list}>
          {disputes.map((d) => {
            const order =
              typeof d.order === "string"
                ? null
                : (d.order as Pick<Order, "_id" | "orderNumber"> & {
                    pricing?: OrderPricing;
                  });
            const raisedBy = typeof d.raisedBy === "string" ? null : d.raisedBy;
            return (
              <div key={d._id} className={classes.card}>
                <div className={classes.cardHeader}>
                  <div>
                    <Link
                      to={PATHS.orderDetail(order?._id)}
                      className={classes.orderLink}
                    >
                      Order #{order?.orderNumber} —{" "}
                      {formatCurrency(order?.pricing?.totalAmount)}
                    </Link>
                    <p className={classes.reason}>
                      Raised by {raisedBy?.name}: {d.reason}
                    </p>
                    {d.description && (
                      <p className={classes.description}>{d.description}</p>
                    )}
                    <p className={classes.createdAt}>
                      {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[d.status]}>
                    {d.status.replace("_", " ")}
                  </Badge>
                </div>
                {["open", "in_review"].includes(d.status) && (
                  <Button
                    size="sm"
                    className={classes.resolveButton}
                    onClick={() => setResolveTarget(d)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal
        open={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        title="Resolve dispute"
      >
        <Textarea
          label="Resolution notes"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={3}
        />
        <div className={classes.modalActions}>
          <Button
            className={classes.modalActionButton}
            onClick={() => handleResolve("resolved")}
          >
            Resolve for Buyer
          </Button>
          <Button
            variant="danger"
            className={classes.modalActionButton}
            onClick={() => handleResolve("rejected")}
          >
            Reject Dispute
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Disputes;
