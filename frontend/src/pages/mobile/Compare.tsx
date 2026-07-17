import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { X } from "lucide-react";
import api from "../../api/api";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { ApiResponse } from "../../types/api";
import type { Mobile, User } from "../../types/models";


type PopulatedSeller = Pick<
  User,
  "_id" | "name" | "avatar" | "sellerProfile"
> & { ratingAvg?: number };

interface CompareRow {
  label: string;
  key: (m: Mobile) => string;
}

const ROWS: CompareRow[] = [
  { label: "Price", key: (m) => formatCurrency(m.price) },
  { label: "Brand", key: (m) => m.brand },
  { label: "Model", key: (m) => m.model },
  { label: "Storage", key: (m) => `${m.storage} GB` },
  { label: "RAM", key: (m) => `${m.ram} GB` },
  { label: "Condition", key: (m) => m.condition },
  { label: "Battery Health", key: (m) => `${m.batteryHealth}%` },
  { label: "IMEI Verified", key: (m) => (m.imeiVerified ? "Yes" : "No") },
  { label: "Warranty", key: (m) => (m.warranty?.hasWarranty ? "Yes" : "No") },
  {
    label: "Original Box",
    key: (m) => (m.originalBoxAvailable ? "Yes" : "No"),
  },
  { label: "Charger Included", key: (m) => (m.chargerIncluded ? "Yes" : "No") },
  {
    label: "Location",
    key: (m) => `${m.location?.city}, ${m.location?.state}`,
  },
  {
    label: "Seller Rating",
    key: (m) => {
      const seller =
        typeof m.seller === "string"
          ? undefined
          : (m.seller as PopulatedSeller);
      return seller?.ratingAvg ? `${seller.ratingAvg} / 5` : "No ratings yet";
    },
  },
];

const classes = {
  emptyWrapper: "mx-auto max-w-7xl px-4 py-12",
  browseLink: "text-sm font-medium text-brand-600 hover:underline",
  page: "mx-auto max-w-7xl overflow-x-auto px-4 py-8",
  heading: "mb-6 text-xl font-bold",
  table: "w-full min-w-[600px] border-collapse text-sm",
  cornerHeadCell: "w-40 p-3 text-left",
  headCell: "p-3 text-left",
  cardWrapper: "relative w-40",
  removeButton:
    "absolute -top-1 -right-1 rounded-full bg-gray-100 p-1 dark:bg-gray-800",
  removeIcon: "size-3",
  thumbnail:
    "mb-2 aspect-square w-full rounded-lg bg-gray-100 object-cover dark:bg-gray-800",
  cardTitle: "font-semibold hover:text-brand-600",
  bodyRow: "border-t border-gray-100 dark:border-gray-800",
  labelCell: "p-3 font-medium text-gray-500",
  valueCell: "p-3",
};

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
  const [mobiles, setMobiles] = useState<Mobile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        api
          .get<ApiResponse<Mobile>>(`/mobiles/${id}`)
          .then((r) => r.data.data)
          .catch(() => null),
      ),
    )
      .then((results) =>
        setMobiles(results.filter((m): m is Mobile => m !== null)),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("ids")]);

  const removeMobile = (id: string) => {
    const next = ids.filter((i) => i !== id);
    setSearchParams(next.length ? { ids: next.join(",") } : {});
  };

  if (loading) return <Spinner full />;

  if (!mobiles.length) {
    return (
      <div className={classes.emptyWrapper}>
        <EmptyState
          title="Nothing to compare yet"
          description="Pick two or more phones from the search page and add them to comparison."
          action={
            <Link to={PATHS.search} className={classes.browseLink}>
              Browse phones
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <h1 className={classes.heading}>Compare Phones</h1>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.cornerHeadCell} />
            {mobiles.map((m) => (
              <th key={m._id} className={classes.headCell}>
                <div className={classes.cardWrapper}>
                  <button
                    onClick={() => removeMobile(m._id)}
                    className={classes.removeButton}
                  >
                    <X className={classes.removeIcon} />
                  </button>
                  <img
                    src={m.images?.[0]?.url}
                    alt={m.model}
                    className={classes.thumbnail}
                  />
                  <Link
                    to={PATHS.mobileDetail(m._id)}
                    className={classes.cardTitle}
                  >
                    {m.brand} {m.model}
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className={classes.bodyRow}>
              <td className={classes.labelCell}>{row.label}</td>
              {mobiles.map((m) => (
                <td key={m._id} className={classes.valueCell}>
                  {row.key(m)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Compare;
