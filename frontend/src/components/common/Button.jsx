import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-300',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({ variant = 'primary', size = 'md', loading, disabled, className, children, icon: Icon, ...props }) => (
  <button
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70',
      VARIANTS[variant],
      SIZES[size],
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
    {children}
  </button>
);

export default Button;
