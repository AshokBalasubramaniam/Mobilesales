import { Check, Package, PackageCheck, Truck, Home, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { DELIVERY_STATUS_STEPS } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

const ICONS = { pending: Package, packed: PackageCheck, shipped: Truck, out_for_delivery: Truck, delivered: Home };

const OrderTrackingTimeline = ({ order }) => {
  if (order.deliveryStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
        <XCircle className="size-5" /> Order cancelled{order.cancelReason ? `: ${order.cancelReason}` : ''}
      </div>
    );
  }

  const currentIdx = DELIVERY_STATUS_STEPS.indexOf(order.deliveryStatus);

  return (
    <div className="flex items-start">
      {DELIVERY_STATUS_STEPS.map((step, idx) => {
        const Icon = ICONS[step];
        const done = idx <= currentIdx;
        const event = order.trackingHistory?.find((h) => h.status === step);
        return (
          <div key={step} className="flex flex-1 flex-col items-center text-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={clsx(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  done ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-800'
                )}
              >
                {done && idx < currentIdx ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              {idx < DELIVERY_STATUS_STEPS.length - 1 && (
                <div className={clsx('h-0.5 flex-1', idx < currentIdx ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-800')} />
              )}
            </div>
            <span className="mt-2 text-xs font-medium capitalize">{step.replace(/_/g, ' ')}</span>
            {event && <span className="text-[10px] text-gray-400">{formatDateTime(event.timestamp)}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTrackingTimeline;
