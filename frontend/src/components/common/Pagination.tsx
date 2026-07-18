import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { PaginationMeta } from "../../types/api";

export interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}

const classes = {
  nav: "flex items-center justify-center gap-1 py-6",
  navButton: "rounded-lg p-2 disabled:opacity-40 hover:bg-gray-100",
  navIcon: "size-4",
  pageGroup: "flex items-center",
  ellipsis: "px-1 text-gray-400",
  pageButton: "size-9 rounded-lg text-sm font-medium",
  pageButtonActive: "bg-brand-600 text-white",
  pageButtonInactive: "hover:bg-gray-100",
};

const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1,
  );

  return (
    <nav className={classes.nav}>
      <button
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPrevPage}
        className={classes.navButton}
        aria-label="Previous page"
      >
        <ChevronLeft className={classes.navIcon} />
      </button>

      {pages.map((p, idx) => (
        <span key={p} className={classes.pageGroup}>
          {idx > 0 && pages[idx - 1] !== p - 1 && (
            <span className={classes.ellipsis}>…</span>
          )}
          <button
            onClick={() => onPageChange(p)}
            className={clsx(
              classes.pageButton,
              p === meta.page
                ? classes.pageButtonActive
                : classes.pageButtonInactive,
            )}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNextPage}
        className={classes.navButton}
        aria-label="Next page"
      >
        <ChevronRight className={classes.navIcon} />
      </button>
    </nav>
  );
};

export default Pagination;
