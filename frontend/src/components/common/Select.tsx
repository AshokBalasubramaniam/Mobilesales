import type { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const classes = {
  wrapper: 'w-full',
  label: 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300',
  selectBase: 'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors',
  selectFocus: 'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-brand-900/40',
  selectError: 'border-red-400',
  selectNormal: 'border-gray-300 dark:border-gray-700',
  error: 'mt-1 text-xs text-red-500',
};

const Select = ({ label, error, className, id, children, ...props }: SelectProps) => (
  <div className={classes.wrapper}>
    {label && (
      <label htmlFor={id} className={classes.label}>
        {label}
      </label>
    )}
    <select
      id={id}
      className={clsx(
        classes.selectBase,
        classes.selectFocus,
        error ? classes.selectError : classes.selectNormal,
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className={classes.error}>{error}</p>}
  </div>
);

export default Select;
