import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Mobile } from "../../types/models";

export interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  viewAllHref: string;
  listings?: Mobile[];
  loading?: boolean;
  isNew?: boolean;
}

const classes = {
  card: "rounded-xl border border-gray-100 bg-white p-4 shadow-sm",
  headerRow:
    "mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
  title: "font-display text-base font-bold text-gray-900",
  subtitle: "text-xs text-gray-400",
  actions: "flex items-center justify-between gap-2 sm:justify-end",
  viewAll: "text-xs font-semibold text-brand-700 hover:underline",
  arrows: "flex gap-1",
  arrowButton:
    "flex size-6 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-brand-600 hover:text-brand-700",
  arrowIcon: "size-3.5",
  scrollRow: "stagger flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]",
  skeletonCard: "shrink-0 overflow-hidden rounded-xl border border-gray-100",
  skeletonImage: "skeleton",
  skeletonBody: "space-y-2 p-3",
  empty: "py-8 text-center text-sm text-gray-400",
};

const ProductCarousel = ({
  title,
  subtitle,
  header,
  viewAllHref,
  listings,
  loading,
  isNew,
}: ProductCarouselProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  if (!loading && !listings?.length) return null;

  return (
    <div className={classes.card}>
      <div className={classes.headerRow}>
        {header ?? (
          <div>
            {title && <h2 className={classes.title}>{title}</h2>}
            {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={classes.actions}>
          <Link to={viewAllHref} className={classes.viewAll}>
            View All
          </Link>
          <div className={classes.arrows}>
            <button
              type="button"
              onClick={() => scroll("left")}
              className={classes.arrowButton}
              aria-label="Scroll left"
            >
              <ChevronLeft className={classes.arrowIcon} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className={classes.arrowButton}
              aria-label="Scroll right"
            >
              <ChevronRight className={classes.arrowIcon} />
            </button>
          </div>
        </div>
      </div>

      <div ref={ref} className={classes.scrollRow}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={classes.skeletonCard} style={{ width: 170 }}>
              <div className={classes.skeletonImage} style={{ height: 130 }} />
              <div className={classes.skeletonBody}>
                <div className="skeleton h-3 w-4/5" />
                <div className="skeleton h-3 w-3/5" />
                <div className="skeleton h-4 w-2/5" />
              </div>
            </div>
          ))
          : listings?.map((mobile) => (
            <ProductCard key={mobile._id} mobile={mobile} isNew={isNew} />
          ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
