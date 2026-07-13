import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { mobilesApi, type MobileListParams } from '../../api/mobiles.api';
import FilterSidebar, { type MobileFilters } from '../../components/mobile/FilterSidebar';
import ListingGrid from '../../components/mobile/ListingGrid';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useDebounce } from '../../hooks/useDebounce';
import { PATHS } from '../../routes/paths';
import type { PaginationMeta } from '../../types/api';
import type { Mobile } from '../../types/models';

const parseFilters = (searchParams: URLSearchParams): MobileFilters => {
  const obj: MobileFilters = {};
  for (const [key, value] of searchParams.entries()) {
    if (['brand', 'storage', 'ram'].includes(key)) {
      const existing = obj[key] as string[] | undefined;
      obj[key] = existing ? [...existing, value] : [value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const debouncedFilters = useDebounce(filters, 350);

  const [listings, setListings] = useState<Mobile[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [compareList, setCompareList] = useState<Mobile[]>([]);

  useEffect(() => {
    setLoading(true);
    mobilesApi
      // The FilterSidebar's MobileFilters (URL-query-string shaped: string /
      // string[] values) is looser than the API's MobileListParams — cast at
      // this boundary rather than widening either type.
      .list(debouncedFilters as unknown as MobileListParams)
      .then(({ data }) => {
        setListings(data.data);
        setMeta(data.meta ?? null);
      })
      .finally(() => setLoading(false));
  }, [debouncedFilters]);

  const updateFilters = (next: MobileFilters) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) return;
      if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)));
      else params.set(key, String(value));
    });
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCompare = (mobile: Mobile) => {
    setCompareList((list) => {
      const exists = list.some((m) => m._id === mobile._id);
      if (exists) return list.filter((m) => m._id !== mobile._id);
      if (list.length >= 4) return list;
      return [...list, mobile];
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {filters.q ? `Results for "${filters.q}"` : 'Browse Phones'}
          {meta && <span className="ml-2 text-sm font-normal text-gray-500">({meta.total} found)</span>}
        </h1>
        <div className="flex items-center gap-2">
          <Select value={filters.sort || 'newest'} onChange={(e) => updateFilters({ ...filters, sort: e.target.value })} className="w-40">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </Select>
          <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)} icon={SlidersHorizontal}>
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={updateFilters} onClear={() => setSearchParams({})} />
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 flex bg-black/50 lg:hidden">
            <div className="ml-auto h-full w-80 overflow-y-auto bg-white p-4 dark:bg-gray-950">
              <div className="mb-4 flex justify-end">
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={updateFilters} onClear={() => setSearchParams({})} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <ListingGrid listings={listings} loading={loading} onCompareToggle={toggleCompare} compareIds={compareList.map((m) => m._id)} />
          <Pagination meta={meta ?? undefined} onPageChange={handlePageChange} />
        </div>
      </div>

      {compareList.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {compareList.map((m) => (
                <span key={m._id} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
                  {m.brand} {m.model}
                  <button onClick={() => toggleCompare(m)}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <Button
              disabled={compareList.length < 2}
              onClick={() => navigate(`${PATHS.compare}?ids=${compareList.map((m) => m._id).join(',')}`)}
            >
              Compare ({compareList.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
