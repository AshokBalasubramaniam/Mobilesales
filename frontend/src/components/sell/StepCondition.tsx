import type { Dispatch, SetStateAction } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import { MOBILE_CONDITIONS } from '../../utils/constants';
import type { MobileCondition } from '../../types/models';
import type { SellPhoneForm } from './StepIdentity';

const ACCESSORY_OPTIONS = ['Charger', 'Earphones', 'Box', 'Manual', 'Case', 'Screen Guard'];

export interface StepConditionProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const StepCondition = ({ form, setForm }: StepConditionProps) => {
  const toggleAccessory = (item: string) => {
    const list = form.accessoriesIncluded.includes(item)
      ? form.accessoriesIncluded.filter((a) => a !== item)
      : [...form.accessoriesIncluded, item];
    setForm({ ...form, accessoriesIncluded: list });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Condition & history</h2>

      <Select
        label="Overall condition"
        required
        value={form.condition}
        onChange={(e) => setForm({ ...form, condition: e.target.value as MobileCondition | '' })}
      >
        <option value="">Select condition</option>
        {MOBILE_CONDITIONS.map((c) => (
          <option key={c} value={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </Select>

      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Battery health: {form.batteryHealth}%</p>
        <input
          type="range"
          min="0"
          max="100"
          value={form.batteryHealth}
          onChange={(e) => setForm({ ...form, batteryHealth: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
      </div>

      <Input
        label="IMEI number (optional)"
        placeholder="15-digit IMEI"
        maxLength={15}
        value={form.imei}
        onChange={(e) => setForm({ ...form, imei: e.target.value.replace(/\D/g, '') })}
        hint="Dial *#06# on the phone to find its IMEI"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.warranty.hasWarranty}
          onChange={(e) => setForm({ ...form, warranty: { ...form.warranty, hasWarranty: e.target.checked } })}
        />
        Still under manufacturer warranty
      </label>
      {form.warranty.hasWarranty && (
        <Input
          type="date"
          label="Warranty expiry"
          value={form.warranty.expiryDate}
          onChange={(e) => setForm({ ...form, warranty: { ...form.warranty, expiryDate: e.target.value } })}
        />
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.hasRepairHistory} onChange={(e) => setForm({ ...form, hasRepairHistory: e.target.checked })} />
        This phone has been repaired before
      </label>
      {form.hasRepairHistory && (
        <Input
          placeholder="Describe the repair (e.g. screen replacement in 2024)"
          value={form.repairNote}
          onChange={(e) => setForm({ ...form, repairNote: e.target.value })}
        />
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.originalBoxAvailable} onChange={(e) => setForm({ ...form, originalBoxAvailable: e.target.checked })} />
        Original box available
      </label>

      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Accessories included</p>
        <div className="flex flex-wrap gap-2">
          {ACCESSORY_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAccessory(item)}
              className={`rounded-full border px-3 py-1 text-xs ${
                form.accessoriesIncluded.includes(item) ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepCondition;
