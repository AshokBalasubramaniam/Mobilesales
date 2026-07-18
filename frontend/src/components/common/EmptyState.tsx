import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}

const classes = {
  container:
    "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 py-16 text-center",
  icon: "size-10 text-gray-400",
  title: "text-base font-semibold text-gray-800",
  description: "max-w-sm text-sm text-gray-500",
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className={classes.container}>
    {Icon && <Icon className={classes.icon} />}
    <h3 className={classes.title}>{title}</h3>
    {description && <p className={classes.description}>{description}</p>}
    {action}
  </div>
);

export default EmptyState;
