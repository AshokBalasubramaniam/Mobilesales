import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Gavel } from 'lucide-react';
import { reportsApi } from '../../api/reports.api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/format';
import { PATHS } from '../../routes/paths';

const STATUS_VARIANT = { open: 'amber', in_review: 'brand', resolved: 'green', rejected: 'red' };

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolution, setResolution] = useState('');

  const load = () => {
    setLoading(true);
    reportsApi
      .listDisputes({ page })
      .then(({ data }) => {
        setDisputes(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleResolve = async (status) => {
    try {
      await reportsApi.resolveDispute(resolveTarget._id, { status, resolution });
      toast.success('Dispute updated');
      setResolveTarget(null);
      setResolution('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update dispute');
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Disputes</h2>

      {disputes.length === 0 ? (
        <EmptyState icon={Gavel} title="No disputes" description="No buyer/seller disputes to resolve." />
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={PATHS.orderDetail(d.order._id)} className="font-medium hover:text-brand-600">
                    Order #{d.order.orderNumber} — {formatCurrency(d.order.pricing?.totalAmount)}
                  </Link>
                  <p className="text-sm text-gray-500">Raised by {d.raisedBy?.name}: {d.reason}</p>
                  {d.description && <p className="mt-1 text-sm text-gray-400">{d.description}</p>}
                  <p className="mt-1 text-xs text-gray-400">{formatDate(d.createdAt)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[d.status]}>{d.status.replace('_', ' ')}</Badge>
              </div>
              {['open', 'in_review'].includes(d.status) && (
                <Button size="sm" className="mt-3" onClick={() => setResolveTarget(d)}>
                  Resolve
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal open={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolve dispute">
        <Textarea label="Resolution notes" value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} />
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={() => handleResolve('resolved')}>
            Resolve for Buyer
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => handleResolve('rejected')}>
            Reject Dispute
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Disputes;
