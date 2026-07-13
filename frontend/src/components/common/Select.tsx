import type { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = ({ label, error, className, id, children, ...props }: SelectProps) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <select
      id={id}
      className={clsx(
        'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors',
        'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-brand-900/40',
        error ? 'border-red-400' : 'border-gray-300 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default Select;
