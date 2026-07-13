import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { Sparkles, FileUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { mobilesApi } from '../../api/mobiles.api';
import type { PriceSuggestion } from '../../api/mobiles.api';
import { formatCurrency } from '../../utils/format';
import type { SellPhoneForm } from './StepIdentity';

export interface StepPricingProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const StepPricing = ({ form, setForm }: StepPricingProps) => {
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);

  const canSuggest = form.brand && form.model && form.storage && form.ram && form.condition && form.batteryHealth;

  const handleSuggest = async () => {
    if (!canSuggest) return toast.error('Fill in brand, model, storage, RAM, condition and battery health first');
    if (!form.condition) return;
    setSuggesting(true);
    try {
      const { data } = await mobilesApi.suggestPrice({
        brand: form.brand,
        model: form.model,
        storage: Number(form.storage),
        ram: Number(form.ram),
        condition: form.condition,
        batteryHealth: Number(form.batteryHealth),
        mrp: form.mrp ? Number(form.mrp) : undefined,
      });
      setSuggestion(data.data);
    } catch {
      toast.error('Could not generate a suggestion right now');
    } finally {
      setSuggesting(false);
    }
  };

  const onPurchaseBillSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, purchaseBill: file });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Set your price</h2>

      <Input label="Original price / MRP (optional)" type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />

      <div>
        <Input label="Expected price (₹)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Button type="button" variant="secondary" size="sm" className="mt-2" icon={Sparkles} loading={suggesting} onClick={handleSuggest}>
          Get AI Price Suggestion
        </Button>
        {suggestion && (
          <div className="mt-2 rounded-lg bg-brand-50 p-3 text-sm dark:bg-brand-900/20">
            Suggested price: <strong>{formatCurrency(suggestion.suggestedPrice)}</strong> (range {formatCurrency(suggestion.priceRange.min)}–
            {formatCurrency(suggestion.priceRange.max)})
            <button
              type="button"
              onClick={() => setForm({ ...form, price: String(suggestion.suggestedPrice) })}
              className="ml-2 font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Use this price
            </button>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} />
        Open to price negotiation
      </label>

      <Textarea
        label="Description"
        rows={4}
        placeholder="Describe your phone's condition, usage history, and reason for selling..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Purchase bill (optional)</p>
        {form.purchaseBill ? (
          <div className="flex items-center gap-2 text-sm">
            <FileUp className="size-4" /> {form.purchaseBill.name}
            <button type="button" onClick={() => setForm({ ...form, purchaseBill: null })}>
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 dark:border-gray-700">
            <FileUp className="size-4" /> Upload bill (image or PDF)
            <input type="file" accept="image/*,application/pdf" hidden onChange={onPurchaseBillSelected} />
          </label>
        )}
      </div>
    </div>
  );
};

export default StepPricing;
