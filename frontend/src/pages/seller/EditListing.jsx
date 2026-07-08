import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, ImagePlus, X } from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { mobilesApi } from '../../api/mobiles.api';
import { MOBILE_CONDITIONS } from '../../utils/constants';
import { PATHS } from '../../routes/paths';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(null);
  const [form, setForm] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    mobilesApi.getById(id).then(({ data }) => {
      const m = data.data;
      setMobile(m);
      setForm({
        price: m.price,
        mrp: m.mrp || '',
        negotiable: m.negotiable,
        condition: m.condition,
        batteryHealth: m.batteryHealth,
        description: m.description || '',
      });
    });
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await mobilesApi.update(id, {
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        negotiable: form.negotiable,
        condition: form.condition,
        batteryHealth: Number(form.batteryHealth),
        description: form.description,
      });
      if (newPhotos.length) await mobilesApi.uploadImages(id, newPhotos);
      toast.success('Listing updated — resubmitted for approval');
      navigate(PATHS.seller.listings);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mobilesApi.remove(id);
      toast.success('Listing removed');
      navigate(PATHS.seller.listings);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove listing');
    } finally {
      setDeleting(false);
    }
  };

  if (!mobile || !form) return <Spinner full />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">
        Edit {mobile.brand} {mobile.model}
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {mobile.images?.map((img) => (
          <img key={img.url} src={img.url} alt="" className="size-20 rounded-lg object-cover" />
        ))}
        {newPhotos.map((file, idx) => (
          <div key={idx} className="relative size-20">
            <img src={URL.createObjectURL(file)} alt="" className="size-full rounded-lg object-cover" />
            <button onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white">
              <X className="size-3" />
            </button>
          </div>
        ))}
        <label className="flex size-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 dark:border-gray-700">
          <ImagePlus className="size-5" />
          <input type="file" accept="image/*" multiple hidden onChange={(e) => setNewPhotos([...newPhotos, ...Array.from(e.target.files)])} />
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (₹)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="MRP (₹)" type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
        </div>
        <Select label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
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
            onChange={(e) => setForm({ ...form, batteryHealth: e.target.value })}
            className="w-full accent-brand-600"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} />
          Open to negotiation
        </label>
        <Textarea label="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <p className="text-xs text-amber-600">Saving changes will resubmit this listing for admin approval.</p>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>
            Delete Listing
          </Button>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this listing?"
        description="This will remove the listing from the marketplace. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default EditListing;
