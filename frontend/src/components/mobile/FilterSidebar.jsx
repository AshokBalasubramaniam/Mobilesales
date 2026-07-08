import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { POPULAR_BRANDS, MOBILE_CONDITIONS, STORAGE_OPTIONS, RAM_OPTIONS, INDIAN_STATES } from '../../utils/constants';

const CheckboxGroup = ({ label, options, selected, onChange }) => (
  <div>
    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const value = String(opt.value ?? opt);
        const optLabel = opt.label ?? opt;
        const isActive = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(isActive ? selected.filter((v) => v !== value) : [...selected, value])}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              isActive ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  </div>
);

const FilterSidebar = ({ filters, onChange, onClear }) => {
  const [locating, setLocating] = useState(false);

  const set = (patch) => onChange({ ...filters, ...patch });

  const toggleArrayFilter = (key, values) => set({ [key]: values });

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by your browser');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({ lat: pos.coords.latitude, lng: pos.coords.longitude, radiusKm: filters.radiusKm || 25 });
        setLocating(false);
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      }
    );
  };

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-72">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <button onClick={onClear} className="text-xs text-brand-600 hover:underline">
          Clear all
        </button>
      </div>

      <CheckboxGroup
        label="Brand"
        options={POPULAR_BRANDS}
        selected={filters.brand || []}
        onChange={(v) => toggleArrayFilter('brand', v)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Price range</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      <CheckboxGroup
        label="Storage (GB)"
        options={STORAGE_OPTIONS}
        selected={filters.storage || []}
        onChange={(v) => toggleArrayFilter('storage', v)}
      />

      <CheckboxGroup label="RAM (GB)" options={RAM_OPTIONS} selected={filters.ram || []} onChange={(v) => toggleArrayFilter('ram', v)} />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Min. battery health</p>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minBatteryHealth || 0}
          onChange={(e) => set({ minBatteryHealth: e.target.value })}
          className="w-full accent-brand-600"
        />
        <p className="text-xs text-gray-500">{filters.minBatteryHealth || 0}%+</p>
      </div>

      <Select label="Condition" value={filters.condition || ''} onChange={(e) => set({ condition: e.target.value })}>
        <option value="">Any condition</option>
        {MOBILE_CONDITIONS.map((c) => (
          <option key={c} value={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </Select>

      <Select label="State" value={filters.state || ''} onChange={(e) => set({ state: e.target.value })}>
        <option value="">Any state</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Input label="City" value={filters.city || ''} onChange={(e) => set({ city: e.target.value })} />
      <Input label="Pincode" value={filters.pincode || ''} onChange={(e) => set({ pincode: e.target.value })} />

      <div>
        <Button variant="secondary" size="sm" className="w-full" onClick={useMyLocation} loading={locating} icon={MapPin}>
          Search near me
        </Button>
        {filters.lat && (
          <button onClick={() => set({ lat: undefined, lng: undefined, radiusKm: undefined })} className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:underline">
            <X className="size-3" /> Clear location filter
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!filters.hasWarranty} onChange={(e) => set({ hasWarranty: e.target.checked || undefined })} />
          Under warranty
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!filters.verifiedSeller}
            onChange={(e) => set({ verifiedSeller: e.target.checked || undefined })}
          />
          Verified seller only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!filters.verifiedImei} onChange={(e) => set({ verifiedImei: e.target.checked || undefined })} />
          IMEI verified only
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
