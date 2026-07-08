import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1 py-6">
      <button
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPrevPage}
        className="rounded-lg p-2 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            onClick={() => onPageChange(p)}
            className={clsx(
              'size-9 rounded-lg text-sm font-medium',
              p === meta.page ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNextPage}
        className="rounded-lg p-2 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
};

export default Pagination;
