import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

const PADDING = { sm: 'p-4', md: 'p-5' } as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  hoverable?: boolean;
  padding?: keyof typeof PADDING;
}

/** Shared bordered-card wrapper — extracted from the near-identical markup
 * previously duplicated across PopularBrands, FeaturedSellers and CustomerReviews. */
const Card = ({ children, hoverable, padding = 'md', className, ...props }: CardProps) => (
  <div
    className={clsx(
      'rounded-xl border border-gray-200 dark:border-gray-800',
      PADDING[padding],
      hoverable && 'transition-colors hover:border-brand-400 hover:shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
