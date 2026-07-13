import { Star } from 'lucide-react';
import clsx from 'clsx';

export interface StarRatingProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const StarRating = ({ value = 0, size = 'sm', interactive = false, onChange }: StarRatingProps) => {
  const sizeClass = size === 'lg' ? 'size-6' : size === 'md' ? 'size-5' : 'size-4';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={!interactive} onClick={() => onChange?.(star)} className={clsx(!interactive && 'cursor-default')}>
          <Star
            className={clsx(
              sizeClass,
              star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
