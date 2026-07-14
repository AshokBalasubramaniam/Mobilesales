import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';
import type { ApiResponse } from '../../types/api';
import type { Coupon } from '../../types/models';

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<Coupon[]>>('/coupons/active')
      .then(({ data }) => setCoupons(data.data))
      .finally(() => setLoading(false));
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code}`);
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Available Coupons</h2>
      {coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No active coupons" description="Check back later for new offers." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {coupons.map((c) => (
            <button
              key={c._id}
              onClick={() => copyCode(c.code)}
              className="rounded-xl border-2 border-dashed border-brand-300 p-4 text-left hover:bg-brand-50 dark:border-brand-800 dark:hover:bg-brand-900/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-brand-700 dark:text-brand-300">{c.code}</span>
                <Badge variant="brand">
                  {c.discountType === 'flat' ? formatCurrency(c.discountValue) : `${c.discountValue}%`} off
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">{c.description}</p>
              <p className="mt-2 text-xs text-gray-400">
                Min. order {formatCurrency(c.minOrderValue)} · Valid till {formatDate(c.validUntil)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
