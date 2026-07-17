import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Trash2, ImagePlus, X } from "lucide-react";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Spinner from "../../components/common/Spinner";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import { MOBILE_CONDITIONS } from "../../utils/constants";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";
import type { SellPhoneForm } from "../../components/sell/StepIdentity";


type EditListingForm = Pick<
  SellPhoneForm,
  "price" | "mrp" | "negotiable" | "condition" | "batteryHealth" | "description"
>;

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? "Something went wrong")
    : "Something went wrong";

const classes = {
  container: "mx-auto max-w-2xl px-4 py-10",
  title: "mb-6 text-2xl font-bold",
  photosRow: "mb-6 flex flex-wrap gap-2",
  existingPhoto: "size-20 rounded-lg object-cover",
  newPhotoWrapper: "relative size-20",
  newPhotoImage: "size-full rounded-lg object-cover",
  removePhotoButton:
    "absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white",
  removePhotoIcon: "size-3",
  addPhotoLabel:
    "flex size-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 dark:border-gray-700",
  addPhotoIcon: "size-5",
  form: "space-y-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-800",
  priceGrid: "grid grid-cols-2 gap-4",
  batteryLabel: "mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300",
  batterySlider: "w-full accent-brand-600",
  negotiableLabel: "flex items-center gap-2 text-sm",
  warningText: "text-xs text-amber-600",
  actionsRow: "flex justify-between pt-2",
};

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState<Mobile | null>(null);
  const [form, setForm] = useState<EditListingForm | null>(null);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<Mobile>>(`/mobiles/${id}`).then(({ data }) => {
      const m = data.data;
      setMobile(m);
      setForm({
        price: String(m.price),
        mrp: m.mrp ? String(m.mrp) : "",
        negotiable: m.negotiable,
        condition: m.condition,
        batteryHealth: m.batteryHealth,
        description: m.description || "",
      });
    });
  }, [id]);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !form || !form.condition) return;
    setSaving(true);
    try {
      await api.patch(`/mobiles/${id}`, {
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        negotiable: form.negotiable,
        condition: form.condition,
        batteryHealth: Number(form.batteryHealth),
        description: form.description,
      });
      if (newPhotos.length) {
        const imagesForm = new FormData();
        newPhotos.forEach((f) => imagesForm.append("images", f));
        await api.post(`/mobiles/${id}/images`, imagesForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("Listing updated — resubmitted for approval");
      navigate(PATHS.seller.listings);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api.delete(`/mobiles/${id}`);
      toast.success("Listing removed");
      navigate(PATHS.seller.listings);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  if (!mobile || !form) return <Spinner full />;

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        Edit {mobile.brand} {mobile.model}
      </h1>

      <div className={classes.photosRow}>
        {mobile.images?.map((img) => (
          <img
            key={img.url}
            src={img.url}
            alt=""
            className={classes.existingPhoto}
          />
        ))}
        {newPhotos.map((file, idx) => (
          <div key={idx} className={classes.newPhotoWrapper}>
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className={classes.newPhotoImage}
            />
            <button
              onClick={() =>
                setNewPhotos(newPhotos.filter((_, i) => i !== idx))
              }
              className={classes.removePhotoButton}
            >
              <X className={classes.removePhotoIcon} />
            </button>
          </div>
        ))}
        <label className={classes.addPhotoLabel}>
          <ImagePlus className={classes.addPhotoIcon} />
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) =>
              setNewPhotos([...newPhotos, ...Array.from(e.target.files || [])])
            }
          />
        </label>
      </div>

      <form onSubmit={handleSave} className={classes.form}>
        <div className={classes.priceGrid}>
          <Input
            label="Price (₹)"
            type="number"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            label="MRP (₹)"
            type="number"
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: e.target.value })}
          />
        </div>
        <Select
          label="Condition"
          value={form.condition}
          onChange={(e) =>
            setForm({
              ...form,
              condition: e.target.value as EditListingForm["condition"],
            })
          }
        >
          {MOBILE_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </Select>
        <div>
          <p className={classes.batteryLabel}>
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
            className={classes.batterySlider}
          />
        </div>
        <label className={classes.negotiableLabel}>
          <input
            type="checkbox"
            checked={form.negotiable}
            onChange={(e) => setForm({ ...form, negotiable: e.target.checked })}
          />
          Open to negotiation
        </label>
        <Textarea
          label="Description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <p className={classes.warningText}>
          Saving changes will resubmit this listing for admin approval.
        </p>

        <div className={classes.actionsRow}>
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={() => setDeleteOpen(true)}
          >
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
