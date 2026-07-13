import type { Dispatch, SetStateAction } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import { POPULAR_BRANDS, STORAGE_OPTIONS, RAM_OPTIONS } from '../../utils/constants';
import type { MobileCondition, MobileLocation } from '../../types/models';

/** Shared shape of the multi-step sell-a-phone wizard form, mirrored from
 * pages/mobile/SellPhone.jsx's INITIAL_FORM. Fields hold raw editable input
 * values (strings) where the corresponding CreateMobilePayload field is a
 * number/enum — those are coerced on publish. */
export interface SellPhoneForm {
  brand: string;
  model: string;
  storage: string;
  ram: string;
  color: string;
  condition: MobileCondition | '';
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

const StepIdentity = ({ form, setForm }: StepIdentityProps) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold">What phone are you selling?</h2>

    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Brand</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR_BRANDS.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => setForm({ ...form, brand })}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              form.brand === brand ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
      <Input className="mt-2" placeholder="Other brand" value={POPULAR_BRANDS.includes(form.brand) ? '' : form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
    </div>

    <Input label="Model" required placeholder="e.g. iPhone 13, Galaxy S22" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />

    <div className="grid grid-cols-2 gap-4">
      <Select label="Storage" value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })}>
        <option value="">Select</option>
        {STORAGE_OPTIONS.map((gb) => (
          <option key={gb} value={gb}>
            {gb} GB
          </option>
        ))}
      </Select>
      <Select label="RAM" value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })}>
        <option value="">Select</option>
        {RAM_OPTIONS.map((gb) => (
          <option key={gb} value={gb}>
            {gb} GB
          </option>
        ))}
      </Select>
    </div>

    <Input label="Color" placeholder="e.g. Midnight Black" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
  </div>
);

export default StepIdentity;
