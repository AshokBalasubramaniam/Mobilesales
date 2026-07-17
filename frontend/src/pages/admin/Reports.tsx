import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Flag } from "lucide-react";
import api from "../../api/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { formatDate } from "../../utils/format";
import type { Report, ReportStatus } from "../../types/models";
import type { ApiResponse, PaginationMeta } from "../../types/api";
import type { BadgeProps } from "../../components/common/Badge";

const STATUS_VARIANT: Record<
  ReportStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  pending: "amber",
  reviewed: "brand",
  resolved: "green",
  dismissed: "gray",
};

const classes = {
  header: "mb-4 flex items-center justify-between",
  title: "text-lg font-semibold",
  statusSelect: "w-40",
  list: "space-y-3",
  card: "rounded-xl border border-gray-200 p-4",
  cardHeader: "flex items-start justify-between",
  reportTitle: "font-medium capitalize",
  reason: "text-sm text-gray-500",
  description: "mt-1 text-sm text-gray-400",
  date: "mt-1 text-xs text-gray-400",
  actions: "mt-3 flex gap-2",
};

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [status, setStatus] = useState<ReportStatus | "">("pending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Report[]>>("/reports", {
        params: { page, status: status || undefined },
      })
      .then(({ data }) => {
        setReports(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status]);

  const handleResolve = async (
    id: string,
    newStatus: "resolved" | "dismissed",
  ) => {
    try {
      await api.patch(`/reports/${id}/resolve`, { status: newStatus });
      toast.success("Report updated");
      load();
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not update report",
      );
    }
  };

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.title}>Reports</h2>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ReportStatus | "");
            setPage(1);
          }}
          className={classes.statusSelect}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </Select>
      </div>

      {loading ? (
        <Spinner full />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports"
          description="Nothing needs your attention right now."
        />
      ) : (
        <div className={classes.list}>
          {reports.map((r) => {
            const reportedBy =
              typeof r.reportedBy === "string" ? null : r.reportedBy;
            return (
              <div key={r._id} className={classes.card}>
                <div className={classes.cardHeader}>
                  <div>
                    <p className={classes.reportTitle}>
                      {r.reportType} report by {reportedBy?.name}
                    </p>
                    <p className={classes.reason}>{r.reason}</p>
                    {r.description && (
                      <p className={classes.description}>{r.description}</p>
                    )}
                    <p className={classes.date}>{formatDate(r.createdAt)}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                </div>
                {r.status === "pending" && (
                  <div className={classes.actions}>
                    <Button
                      size="sm"
                      onClick={() => handleResolve(r._id, "resolved")}
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleResolve(r._id, "dismissed")}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Reports;
