import type { Dispatch, SetStateAction } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import { MOBILE_CONDITIONS } from "../../utils/constants";
import type { MobileCondition } from "../../types/models";
import type { SellPhoneForm } from "./StepIdentity";

const ACCESSORY_OPTIONS = [
  "Charger",
  "Earphones",
  "Box",
  "Manual",
  "Case",
  "Screen Guard",
];

export interface StepConditionProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const classes = {
  container: "space-y-4",
  heading: "text-lg font-bold",
  fieldLabel: "mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300",
  rangeInput: "w-full accent-brand-600",
  checkboxLabel: "flex items-center gap-2 text-sm",
  accessoriesWrap: "flex flex-wrap gap-2",
  accessoryButton: "rounded-full border px-3 py-1 text-xs",
  accessoryActive:
    "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30",
  accessoryInactive: "border-gray-300 dark:border-gray-700",
};

const StepCondition = ({ form, setForm }: StepConditionProps) => {
  const toggleAccessory = (item: string) => {
    const list = form.accessoriesIncluded.includes(item)
      ? form.accessoriesIncluded.filter((a) => a !== item)
      : [...form.accessoriesIncluded, item];
    setForm({ ...form, accessoriesIncluded: list });
  };

  return (
    <div className={classes.container}>
      <h2 className={classes.heading}>Condition & history</h2>

      <Select
        label="Overall condition"
        required
        value={form.condition}
        onChange={(e) =>
          setForm({
            ...form,
            condition: e.target.value as MobileCondition | "",
          })
        }
      >
        <option value="">Select condition</option>
        {MOBILE_CONDITIONS.map((c) => (
          <option key={c} value={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </Select>

      <div>
        <p className={classes.fieldLabel}>
          Battery health: {form.batteryHealth}%
        </p>
        <input
          type="range"
          min="0"
          max="100"
          value={form.batteryHealth}
          onChange={(e) =>
            setForm({ ...form, batteryHealth: Number(e.target.value) })
          }
          className={classes.rangeInput}
        />
      </div>

      <Input
        label="IMEI number (optional)"
        placeholder="15-digit IMEI"
        maxLength={15}
        value={form.imei}
        onChange={(e) =>
          setForm({ ...form, imei: e.target.value.replace(/\D/g, "") })
        }
        hint="Dial *#06# on the phone to find its IMEI"
      />

      <label className={classes.checkboxLabel}>
        <input
          type="checkbox"
          checked={form.warranty.hasWarranty}
          onChange={(e) =>
            setForm({
              ...form,
              warranty: { ...form.warranty, hasWarranty: e.target.checked },
            })
          }
        />
        Still under manufacturer warranty
      </label>
      {form.warranty.hasWarranty && (
        <Input
          type="date"
          label="Warranty expiry"
          value={form.warranty.expiryDate}
          onChange={(e) =>
            setForm({
              ...form,
              warranty: { ...form.warranty, expiryDate: e.target.value },
            })
          }
        />
      )}

      <label className={classes.checkboxLabel}>
        <input
          type="checkbox"
          checked={form.hasRepairHistory}
          onChange={(e) =>
            setForm({ ...form, hasRepairHistory: e.target.checked })
          }
        />
        This phone has been repaired before
      </label>
      {form.hasRepairHistory && (
        <Input
          placeholder="Describe the repair (e.g. screen replacement in 2024)"
          value={form.repairNote}
          onChange={(e) => setForm({ ...form, repairNote: e.target.value })}
        />
      )}

      <label className={classes.checkboxLabel}>
        <input
          type="checkbox"
          checked={form.originalBoxAvailable}
          onChange={(e) =>
            setForm({ ...form, originalBoxAvailable: e.target.checked })
          }
        />
        Original box available
      </label>

      <div>
        <p className={classes.fieldLabel}>Accessories included</p>
        <div className={classes.accessoriesWrap}>
          {ACCESSORY_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAccessory(item)}
              className={`${classes.accessoryButton} ${
                form.accessoriesIncluded.includes(item)
                  ? classes.accessoryActive
                  : classes.accessoryInactive
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
