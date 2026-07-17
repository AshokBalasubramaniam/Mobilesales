import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

const VARIANTS = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
} as const;

export interface BadgeProps {
  variant?: keyof typeof VARIANTS;
  className?: string;
  children?: ReactNode;
  icon?: LucideIcon;
}

const classes = {
  base: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  icon: 'size-3',
};

const Badge = ({ variant = 'gray', className, children, icon: Icon }: BadgeProps) => (
  <span className={clsx(classes.base, VARIANTS[variant], className)}>
    {Icon && <Icon className={classes.icon} />}
    {children}
  </span>
);

export default Badge;
