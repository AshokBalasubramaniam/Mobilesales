import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Flag } from 'lucide-react';
import { reportsApi } from '../../api/reports.api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import type { Report, ReportStatus } from '../../types/models';
import type { PaginationMeta } from '../../types/api';
import type { BadgeProps } from '../../components/common/Badge';

const STATUS_VARIANT: Record<ReportStatus, NonNullable<BadgeProps['variant']>> = {
  pending: 'amber',
  reviewed: 'brand',
  resolved: 'green',
  dismissed: 'gray',
};

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [status, setStatus] = useState<ReportStatus | ''>('pending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    reportsApi
      .list({ page, status: status || undefined })
      .then(({ data }) => {
        setReports(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status]);

  const handleResolve = async (id: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      await reportsApi.resolve(id, { status: newStatus });
      toast.success('Report updated');
      load();
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not update report');
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reports</h2>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ReportStatus | '');
            setPage(1);
          }}
          className="w-40"
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
        <EmptyState icon={Flag} title="No reports" description="Nothing needs your attention right now." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const reportedBy = typeof r.reportedBy === 'string' ? null : r.reportedBy;
            return (
              <div key={r._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium capitalize">
                      {r.reportType} report by {reportedBy?.name}
                    </p>
                    <p className="text-sm text-gray-500">{r.reason}</p>
                    {r.description && <p className="mt-1 text-sm text-gray-400">{r.description}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                </div>
                {r.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => handleResolve(r._id, 'resolved')}>
                      Mark Resolved
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleResolve(r._id, 'dismissed')}>
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
