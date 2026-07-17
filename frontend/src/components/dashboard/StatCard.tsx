import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
}

const classes = {
  card: "rounded-xl border border-gray-200 p-5",
  header: "flex items-center justify-between",
  label: "text-sm text-gray-500",
  icon: "size-5",
  defaultAccent: "text-brand-600",
  value: "mt-2 text-2xl font-bold",
};

const StatCard = ({ icon: Icon, label, value, accent }: StatCardProps) => (
  <div className={classes.card}>
    <div className={classes.header}>
      <span className={classes.label}>{label}</span>
      <Icon className={`${classes.icon} ${accent || classes.defaultAccent}`} />
    </div>
    <p className={classes.value}>{value}</p>
  </div>
);

export default StatCard;
