import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export interface SpinnerProps {
  className?: string;
  full?: boolean;
}

const Spinner = ({ className, full }: SpinnerProps) =>
  full ? (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <Loader2 className={clsx('size-8 animate-spin text-brand-600', className)} />
    </div>
  ) : (
    <Loader2 className={clsx('size-5 animate-spin text-brand-600', className)} />
  );

export default Spinner;
