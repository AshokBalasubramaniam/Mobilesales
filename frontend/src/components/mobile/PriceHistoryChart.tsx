import { formatCurrency, formatDate } from "../../utils/format";
import type { PriceHistoryItem } from "../../types/models";

const WIDTH = 480;
const HEIGHT = 120;
const PADDING = 16;

export interface PriceHistoryChartProps {
  history?: PriceHistoryItem[];
}

const classes = {
  emptyMessage: "text-sm text-gray-500",
  chart: "w-full text-brand-600",
  footerRow: "mt-1 flex justify-between text-xs text-gray-500",
};

const PriceHistoryChart = ({ history = [] }: PriceHistoryChartProps) => {
  if (history.length < 2) {
    return (
      <p className={classes.emptyMessage}>
        Price history will appear once the seller updates the price.
      </p>
    );
  }

  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = history.map((h, i) => {
    const x = PADDING + (i / (history.length - 1)) * (WIDTH - PADDING * 2);
    const y =
      HEIGHT - PADDING - ((h.price - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y, ...h };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={classes.chart}>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
        {points.map((p) => (
          <circle
            key={p.changedAt}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="currentColor"
          />
        ))}
      </svg>
      <div className={classes.footerRow}>
        <span>
          {formatDate(history[0].changedAt)} ·{" "}
          {formatCurrency(history[0].price)}
        </span>
        <span>
          {formatDate(history[history.length - 1].changedAt)} ·{" "}
          {formatCurrency(history[history.length - 1].price)}
        </span>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
