import type { CSSProperties } from 'react';
import type { SalesPoint } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

export interface SalesBarChartProps {
  data?: SalesPoint[];
  labelKey?: keyof SalesPoint;
}

const classes = {
  empty: 'text-sm text-gray-500',
  container: 'flex h-[180px] items-end gap-2 overflow-x-auto pb-2',
  bar: 'group relative flex min-w-8 flex-1 flex-col items-center justify-end gap-1',
  tooltip:
    'pointer-events-none absolute -top-8 hidden rounded bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block',
  barFill: 'h-(--bar-height) w-full rounded-t bg-brand-500 transition-all group-hover:bg-brand-600',
  label: 'text-[10px] text-gray-400',
};

const SalesBarChart = ({ data, labelKey = '_id' }: SalesBarChartProps) => {
  if (!data?.length) return <p className={classes.empty}>No sales in this period yet.</p>;

  const max = Math.max(...data.map((d) => d.totalSales));

  return (
    <div className={classes.container}>
      {data.map((d) => (
        <div key={String(d[labelKey])} className={classes.bar}>
          <span className={classes.tooltip}>
            {formatCurrency(d.totalSales)}
          </span>
          <div
            className={classes.barFill}
            style={{ '--bar-height': `${Math.max((d.totalSales / max) * 130, 4)}px` } as CSSProperties}
          />
          <span className={classes.label}>{String(d[labelKey]).slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

export default SalesBarChart;
