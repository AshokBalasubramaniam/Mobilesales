import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import { formatCurrency, formatDate } from "../../utils/format";
import type { ApiResponse } from "../../types/api";
import type { Coupon } from "../../types/models";

const classes = {
  title: "mb-4 text-lg font-semibold",
  grid: "grid grid-cols-1 gap-3 sm:grid-cols-2",
  couponCard:
    "rounded-xl border-2 border-dashed border-brand-300 p-4 text-left hover:bg-brand-50",
  couponHeader: "flex items-center justify-between",
  code: "font-mono text-lg font-bold text-brand-700",
  description: "mt-1 text-sm text-gray-500",
  meta: "mt-2 text-xs text-gray-400",
};

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<Coupon[]>>("/coupons/active")
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
      <h2 className={classes.title}>Available Coupons</h2>
      {coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No active coupons"
          description="Check back later for new offers."
        />
      ) : (
        <div className={classes.grid}>
          {coupons.map((c) => (
            <button
              key={c._id}
              onClick={() => copyCode(c.code)}
              className={classes.couponCard}
            >
              <div className={classes.couponHeader}>
                <span className={classes.code}>{c.code}</span>
                <Badge variant="brand">
                  {c.discountType === "flat"
                    ? formatCurrency(c.discountValue)
                    : `${c.discountValue}%`}{" "}
                  off
                </Badge>
              </div>
              <p className={classes.description}>{c.description}</p>
              <p className={classes.meta}>
                Min. order {formatCurrency(c.minOrderValue)} · Valid till{" "}
                {formatDate(c.validUntil)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
