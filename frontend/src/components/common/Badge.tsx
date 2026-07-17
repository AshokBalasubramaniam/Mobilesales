import type { ReactNode } from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

const VARIANTS = {
  gray: "bg-gray-100 text-gray-700",
  brand: "bg-brand-100 text-brand-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
} as const;

export interface BadgeProps {
  variant?: keyof typeof VARIANTS;
  className?: string;
  children?: ReactNode;
  icon?: LucideIcon;
}

const classes = {
  base: "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  icon: "size-3",
};

const Badge = ({
  variant = "gray",
  className,
  children,
  icon: Icon,
}: BadgeProps) => (
  <span className={clsx(classes.base, VARIANTS[variant], className)}>
    {Icon && <Icon className={classes.icon} />}
    {children}
  </span>
);

export default Badge;
