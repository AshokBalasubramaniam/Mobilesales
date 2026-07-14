import type { SalesPoint } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

export interface SalesBarChartProps {
  data?: SalesPoint[];
  labelKey?: keyof SalesPoint;
}

const SalesBarChart = ({ data, labelKey = '_id' }: SalesBarChartProps) => {
  if (!data?.length) return <p className="text-sm text-gray-500">No sales in this period yet.</p>;

  const max = Math.max(...data.map((d) => d.totalSales));

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ height: 180 }}>
      {data.map((d) => (
        <div key={String(d[labelKey])} className="group relative flex min-w-8 flex-1 flex-col items-center justify-end gap-1">
          <span className="pointer-events-none absolute -top-8 hidden rounded bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block">
            {formatCurrency(d.totalSales)}
          </span>
          <div
            className="w-full rounded-t bg-brand-500 transition-all group-hover:bg-brand-600"
            style={{ height: `${Math.max((d.totalSales / max) * 130, 4)}px` }}
          />
          <span className="text-[10px] text-gray-400">{String(d[labelKey]).slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

export default SalesBarChart;
