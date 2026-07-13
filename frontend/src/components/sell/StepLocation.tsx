import { useState, type Dispatch, type SetStateAction } from 'react';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { INDIAN_STATES } from '../../utils/constants';
import type { SellPhoneForm } from './StepIdentity';

export interface StepLocationProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const StepLocation = ({ form, setForm }: StepLocationProps) => {
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by your browser');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, location: { ...form.location, lat: pos.coords.latitude, lng: pos.coords.longitude } });
        toast.success('Location captured');
        setLocating(false);
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Where is this phone located?</h2>
      <p className="text-sm text-gray-500">This helps buyers nearby find your listing faster.</p>

      <Select label="State" required value={form.location.state} onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })}>
        <option value="">Select state</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Input label="City" required value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />

      <Input
        label="Pincode"
        required
        maxLength={6}
        value={form.location.pincode}
        onChange={(e) => setForm({ ...form, location: { ...form.location, pincode: e.target.value.replace(/\D/g, '') } })}
      />

      <Button type="button" variant="secondary" size="sm" onClick={useMyLocation} loading={locating} icon={MapPin}>
        Use my current location (for nearby search)
      </Button>
    </div>
  );
};

export default StepLocation;
