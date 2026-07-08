import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, ListChecks } from 'lucide-react';
import { mobilesApi } from '../../api/mobiles.api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/format';
import { PATHS } from '../../routes/paths';

const ListingApprovals = () => {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    mobilesApi
      .pendingApprovals({ page })
      .then(({ data }) => {
        setListings(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleApprove = async (id) => {
    try {
      await mobilesApi.approve(id);
      toast.success('Listing approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve');
    }
  };

  const handleReject = async () => {
    try {
      await mobilesApi.reject(rejectTarget, rejectReason);
      toast.success('Listing rejected');
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject');
    }
  };

  const handleVerifyImei = async (id, verified) => {
    await mobilesApi.verifyImei(id, verified);
    toast.success('IMEI status updated');
    load();
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Listing Approvals</h2>

      {listings.length === 0 ? (
        <EmptyState icon={ListChecks} title="No pending listings" description="All caught up!" />
      ) : (
        <div className="space-y-3">
          {listings.map((mobile) => (
            <div key={mobile._id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <img src={mobile.images?.[0]?.url} alt="" className="size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />
              <div className="min-w-0 flex-1">
                <Link to={PATHS.mobileDetail(mobile._id)} className="font-semibold hover:text-brand-600">
                  {mobile.brand} {mobile.model}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatCurrency(mobile.price)} · Seller: {mobile.seller?.name} ({mobile.seller?.email})
                </p>
                {mobile.imei && <p className="text-xs text-gray-400">IMEI: {mobile.imei}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={mobile.imeiVerified ? 'secondary' : 'ghost'}
                  icon={BadgeCheck}
                  onClick={() => handleVerifyImei(mobile._id, !mobile.imeiVerified)}
                >
                  {mobile.imeiVerified ? 'IMEI Verified' : 'Verify IMEI'}
                </Button>
                <Button size="sm" onClick={() => handleApprove(mobile._id)}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => setRejectTarget(mobile._id)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject listing">
        <Textarea label="Reason" required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        <Button variant="danger" className="mt-4 w-full" onClick={handleReject} disabled={!rejectReason}>
          Reject Listing
        </Button>
      </Modal>
    </div>
  );
};

export default ListingApprovals;
