import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Loader2, type LucideIcon } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-300",
  secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  accent: "bg-accent-500 text-white hover:bg-accent-600",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

const classes = {
  base: "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70",
  icon: "size-4 animate-spin",
  actionIcon: "size-4",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  icon?: LucideIcon;
}

const Button = ({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  icon: Icon,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(classes.base, VARIANTS[variant], SIZES[size], className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <Loader2 className={classes.icon} />
    ) : Icon ? (
      <Icon className={classes.actionIcon} />
    ) : null}
    {children}
  </button>
);

export default Button;
