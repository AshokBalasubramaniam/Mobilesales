import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ListChecks, Pencil, Plus } from 'lucide-react';
import { mobilesApi } from '../../api/mobiles.api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/format';
import { PATHS } from '../../routes/paths';

const STATUS_VARIANT = { active: 'green', pending_approval: 'amber', rejected: 'red', sold: 'brand', removed: 'gray' };
const STATUS_LABEL = { active: 'Live', pending_approval: 'Pending Approval', rejected: 'Rejected', sold: 'Sold', removed: 'Removed' };

const TABS = ['all', 'active', 'pending_approval', 'sold', 'rejected'];

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mobilesApi
      .mine({ page, status: tab === 'all' ? undefined : tab })
      .then(({ data }) => {
        setListings(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, tab]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Listings</h2>
        <Link to={PATHS.sell}>
          <Button size="sm" icon={Plus}>
            New Listing
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              tab === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {t === 'all' ? 'All' : STATUS_LABEL[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner full />
      ) : listings.length === 0 ? (
        <EmptyState icon={ListChecks} title="No listings here" description="Create a new listing to get started." />
      ) : (
        <div className="space-y-3">
          {listings.map((mobile) => (
            <div key={mobile._id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <img src={mobile.images?.[0]?.url} alt="" className="size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />
              <div className="min-w-0 flex-1">
                <Link to={PATHS.mobileDetail(mobile._id)} className="truncate font-semibold hover:text-brand-600">
                  {mobile.brand} {mobile.model}
                </Link>
                <p className="text-sm text-gray-500">{formatCurrency(mobile.price)}</p>
                {mobile.status === 'rejected' && mobile.rejectionReason && (
                  <p className="mt-1 text-xs text-red-500">Reason: {mobile.rejectionReason}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" /> {mobile.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="size-3.5" /> {mobile.likesCount}
                  </span>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[mobile.status]}>{STATUS_LABEL[mobile.status]}</Badge>
              {mobile.status !== 'sold' && (
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
