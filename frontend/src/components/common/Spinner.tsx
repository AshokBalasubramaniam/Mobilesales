import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export interface SpinnerProps {
  className?: string;
  full?: boolean;
}

const classes = {
  fullWrapper: 'flex min-h-[40vh] w-full items-center justify-center',
  fullIcon: 'size-8 animate-spin text-brand-600',
  icon: 'size-5 animate-spin text-brand-600',
};

const Spinner = ({ className, full }: SpinnerProps) =>
  full ? (
    <div className={classes.fullWrapper}>
      <Loader2 className={clsx(classes.fullIcon, className)} />
    </div>
  ) : (
    <Loader2 className={clsx(classes.icon, className)} />
  );

export default Spinner;
