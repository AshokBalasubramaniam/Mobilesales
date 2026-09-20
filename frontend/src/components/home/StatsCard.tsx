import { Lock, Package, Star, Store } from "lucide-react";

const STATS = [
  { icon: Package, value: "50K+", label: "Devices Sold" },
  { icon: Store, value: "15K+", label: "Verified Sellers" },
  { icon: Star, value: "4.8 ★", label: "Customer Rating" },
  { icon: Lock, value: "100%", label: "Secure Payments" },
];

const classes = {
  card: "rounded-xl border border-gray-100 bg-white p-4 shadow-sm",
  grid: "grid grid-cols-2 gap-3",
  item: "flex flex-col items-center rounded-xl bg-gray-50 p-3 text-center",
  iconWrap: "mb-1 text-brand-600",
  value: "text-lg font-black leading-none text-gray-900",
  label: "mt-0.5 text-xs text-gray-500",
};

const StatsCard = () => (
  <div className={classes.card}>
    <div className={classes.grid}>
      {STATS.map((s) => (
        <div key={s.label} className={classes.item}>
          <span className={classes.iconWrap}>
            <s.icon className="size-5" />
          </span>
          <span className={classes.value}>{s.value}</span>
          <span className={classes.label}>{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StatsCard;
