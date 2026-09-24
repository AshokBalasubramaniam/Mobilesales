import { useState, type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Palette, Plus, Smartphone } from "lucide-react";
import Input from "../common/Input";
import Select from "../common/Select";
import {
  BRANDS_BY_CATEGORY,
  POPULAR_BRANDS,
  STORAGE_OPTIONS,
  RAM_OPTIONS,
  DEVICE_CATEGORIES,
  STORAGE_RAM_CATEGORIES,
} from "../../utils/constants";
import { DEVICE_ICON } from "../../utils/deviceIcons";
import { getBrandLogo } from "../../utils/brandLogos";
import type {
  DeviceCategory,
  MobileCondition,
  MobileLocation,
} from "../../types/models";

export interface SellPhoneForm {
  category: DeviceCategory | "";
  brand: string;
  model: string;
  storage: string;
  ram: string;
  color: string;
  condition: MobileCondition | "";
  batteryHealth: number;
  imei: string;
  warranty: { hasWarranty: boolean; expiryDate: string };
  hasRepairHistory: boolean;
  repairNote: string;
  originalBoxAvailable: boolean;
  accessoriesIncluded: string[];
  location: MobileLocation;
  photos: File[];
  video: File | null;
  purchaseBill: File | null;
  mrp: string;
  price: string;
  negotiable: boolean;
  description: string;
}

export interface StepIdentityProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const classes = {
  container: "space-y-5",
  labelRow: "mb-2 flex items-center justify-between gap-3",
  fieldLabel: "text-sm font-semibold text-gray-900",
  contactLink: "text-xs font-semibold text-brand-600 hover:underline",
  pillWrap: "flex flex-wrap gap-2",
  pill: "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
  pillActive: "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500",
  pillInactive: "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
  pillOther: "border-dashed",
  pillIcon: "size-5",
  brandLogo: "size-5 object-contain",
  brandInitial:
    "flex size-5 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600",
  otherBrandInput: "mt-2",
  specsGrid: "grid grid-cols-2 gap-4",
};

const StepIdentity = ({ form, setForm }: StepIdentityProps) => {
  const brands = form.category
    ? BRANDS_BY_CATEGORY[form.category]
    : POPULAR_BRANDS;
  const isOtherBrand = Boolean(form.brand) && !brands.includes(form.brand);
  const [otherOpen, setOtherOpen] = useState(isOtherBrand);

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.labelRow}>
          <p className={classes.fieldLabel}>Category</p>
          <Link to="/contact" className={classes.contactLink}>
            Can&apos;t find your device? Contact us
          </Link>
        </div>
        <div className={classes.pillWrap}>
          {DEVICE_CATEGORIES.map((cat) => {
            const Icon = DEVICE_ICON[cat.value];
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value })}
                className={clsx(
                  classes.pill,
                  form.category === cat.value
                    ? classes.pillActive
                    : classes.pillInactive,
                )}
              >
                <Icon className={classes.pillIcon} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={clsx(classes.fieldLabel, "mb-2")}>Brand</p>
        <div className={classes.pillWrap}>
          {brands.map((brand) => {
            const logo = getBrandLogo(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  setOtherOpen(false);
                  setForm({ ...form, brand });
                }}
                className={clsx(
                  classes.pill,
                  form.brand === brand && !otherOpen
                    ? classes.pillActive
                    : classes.pillInactive,
                )}
              >
                {logo ? (
                  <img src={logo} alt="" className={classes.brandLogo} />
                ) : (
                  <span className={classes.brandInitial}>{brand[0]}</span>
                )}
                {brand}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setOtherOpen(true);
              if (!isOtherBrand) setForm({ ...form, brand: "" });
            }}
            className={clsx(
              classes.pill,
              classes.pillOther,
              otherOpen ? classes.pillActive : classes.pillInactive,
            )}
          >
            <Plus className={classes.pillIcon} />
            Other brand
          </button>
        </div>
        {otherOpen && (
          <Input
            className={classes.otherBrandInput}
            placeholder="Enter brand name"
            autoFocus
            value={isOtherBrand ? form.brand : ""}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
        )}
      </div>

      <Input
        label="Model"
        required
        icon={Smartphone}
        placeholder="e.g. iPhone 13, Galaxy S22"
        value={form.model}
        onChange={(e) => setForm({ ...form, model: e.target.value })}
      />

      {form.category && STORAGE_RAM_CATEGORIES.includes(form.category) && (
        <div className={classes.specsGrid}>
          <Select
            label="Storage"
            value={form.storage}
            onChange={(e) => setForm({ ...form, storage: e.target.value })}
          >
            <option value="">Select</option>
            {STORAGE_OPTIONS.map((gb) => (
              <option key={gb} value={gb}>
                {gb} GB
              </option>
            ))}
          </Select>
          <Select
            label="RAM"
            value={form.ram}
            onChange={(e) => setForm({ ...form, ram: e.target.value })}
          >
            <option value="">Select</option>
            {RAM_OPTIONS.map((gb) => (
              <option key={gb} value={gb}>
                {gb} GB
              </option>
            ))}
          </Select>
        </div>
      )}

      <Input
        label="Color"
        icon={Palette}
        placeholder="e.g. Midnight Black"
        value={form.color}
        onChange={(e) => setForm({ ...form, color: e.target.value })}
      />
    </div>
  );
};

export default StepIdentity;
