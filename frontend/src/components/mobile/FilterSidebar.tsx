import { useState } from "react";
import { MapPin, X } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import {
  POPULAR_BRANDS,
  MOBILE_CONDITIONS,
  STORAGE_OPTIONS,
  RAM_OPTIONS,
  INDIAN_STATES,
} from "../../utils/constants";

export interface MobileFilters {
  q?: string;
  brand?: string[];
  storage?: string[];
  ram?: string[];
  minPrice?: string;
  maxPrice?: string;
  minBatteryHealth?: string;
  condition?: string;
  state?: string;
  city?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  hasWarranty?: boolean;
  verifiedSeller?: boolean;
  verifiedImei?: boolean;
  sort?: string;
  [key: string]: unknown;
}

export interface FilterSidebarProps {
  filters: MobileFilters;
  onChange: (filters: MobileFilters) => void;
  onClear: () => void;
}

type CheckboxOption =
  | string
  | number
  | { value: string | number; label: string };

interface CheckboxGroupProps {
  label: string;
  options: CheckboxOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const classes = {
  fieldLabel: "mb-2 text-sm font-medium text-gray-700 dark:text-gray-300",
  checkboxOptions: "flex flex-wrap gap-2",
  checkboxButtonBase: "rounded-full border px-3 py-1 text-xs font-medium",
  checkboxButtonActive:
    "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  checkboxButtonInactive: "border-gray-300 dark:border-gray-700",
  container: "w-full shrink-0 space-y-6 lg:w-72",
  header: "flex items-center justify-between",
  headerTitle: "text-sm font-semibold",
  clearAllButton: "text-xs text-brand-600 hover:underline",
  priceRow: "flex gap-2",
  batteryRange: "w-full accent-brand-600",
  batteryValue: "text-xs text-gray-500",
  locationButton: "w-full",
  clearLocationButton:
    "mt-1 flex items-center gap-1 text-xs text-gray-500 hover:underline",
  clearLocationIcon: "size-3",
  checkboxesWrapper: "space-y-2",
  checkboxLabel: "flex items-center gap-2 text-sm",
};

const CheckboxGroup = ({
  label,
  options,
  selected,
  onChange,
}: CheckboxGroupProps) => (
  <div>
    <p className={classes.fieldLabel}>{label}</p>
    <div className={classes.checkboxOptions}>
      {options.map((opt) => {
        const value = String(typeof opt === "object" ? opt.value : opt);
        const optLabel = typeof opt === "object" ? opt.label : opt;
        const isActive = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() =>
              onChange(
                isActive
                  ? selected.filter((v) => v !== value)
                  : [...selected, value],
              )
            }
            className={`${classes.checkboxButtonBase} ${
              isActive
                ? classes.checkboxButtonActive
                : classes.checkboxButtonInactive
            }`}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  </div>
);

const FilterSidebar = ({ filters, onChange, onClear }: FilterSidebarProps) => {
  const [locating, setLocating] = useState(false);

  const set = (patch: Partial<MobileFilters>) =>
    onChange({ ...filters, ...patch });

  const toggleArrayFilter = (key: string, values: string[]) =>
    set({ [key]: values });

  const useMyLocation = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation is not supported by your browser");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusKm: filters.radiusKm || 25,
        });
        setLocating(false);
      },
      () => {
        toast.error("Could not get your location");
        setLocating(false);
      },
    );
  };

  return (
    <aside className={classes.container}>
      <div className={classes.header}>
        <h3 className={classes.headerTitle}>Filters</h3>
        <button onClick={onClear} className={classes.clearAllButton}>
          Clear all
        </button>
      </div>

      <CheckboxGroup
        label="Brand"
        options={POPULAR_BRANDS}
        selected={filters.brand || []}
        onChange={(v) => toggleArrayFilter("brand", v)}
      />

      <div>
        <p className={classes.fieldLabel}>Price range</p>
        <div className={classes.priceRow}>
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      <CheckboxGroup
        label="Storage (GB)"
        options={STORAGE_OPTIONS}
        selected={filters.storage || []}
        onChange={(v) => toggleArrayFilter("storage", v)}
      />

      <CheckboxGroup
        label="RAM (GB)"
        options={RAM_OPTIONS}
        selected={filters.ram || []}
        onChange={(v) => toggleArrayFilter("ram", v)}
      />

      <div>
        <p className={classes.fieldLabel}>Min. battery health</p>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minBatteryHealth || 0}
          onChange={(e) => set({ minBatteryHealth: e.target.value })}
          className={classes.batteryRange}
        />
        <p className={classes.batteryValue}>
          {filters.minBatteryHealth || 0}%+
        </p>
      </div>

      <Select
        label="Condition"
        value={filters.condition || ""}
        onChange={(e) => set({ condition: e.target.value })}
      >
        <option value="">Any condition</option>
        {MOBILE_CONDITIONS.map((c) => (
          <option key={c} value={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </Select>

      <Select
        label="State"
        value={filters.state || ""}
        onChange={(e) => set({ state: e.target.value })}
      >
        <option value="">Any state</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Input
        label="City"
        value={filters.city || ""}
        onChange={(e) => set({ city: e.target.value })}
      />
      <Input
        label="Pincode"
        value={filters.pincode || ""}
        onChange={(e) => set({ pincode: e.target.value })}
      />

      <div>
        <Button
          variant="secondary"
          size="sm"
          className={classes.locationButton}
          onClick={useMyLocation}
          loading={locating}
          icon={MapPin}
        >
          Search near me
        </Button>
        {filters.lat && (
          <button
            onClick={() =>
              set({ lat: undefined, lng: undefined, radiusKm: undefined })
            }
            className={classes.clearLocationButton}
          >
            <X className={classes.clearLocationIcon} /> Clear location filter
          </button>
        )}
      </div>

      <div className={classes.checkboxesWrapper}>
        <label className={classes.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!filters.hasWarranty}
            onChange={(e) =>
              set({ hasWarranty: e.target.checked || undefined })
            }
          />
          Under warranty
        </label>
        <label className={classes.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!filters.verifiedSeller}
            onChange={(e) =>
              set({ verifiedSeller: e.target.checked || undefined })
            }
          />
          Verified seller only
        </label>
        <label className={classes.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!filters.verifiedImei}
            onChange={(e) =>
              set({ verifiedImei: e.target.checked || undefined })
            }
          />
          IMEI verified only
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
