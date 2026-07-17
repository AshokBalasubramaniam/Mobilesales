import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Plus, Ticket, Trash2 } from "lucide-react";
import api from "../../api/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/format";
import type { ApiResponse } from "../../types/api";
import type { Coupon, CouponDiscountType } from "../../types/models";

interface CouponForm {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderValue: string;
  validUntil: string;
}

const INITIAL_FORM: CouponForm = {
  code: "",
  description: "",
  discountType: "flat",
  discountValue: "",
  minOrderValue: "",
  validUntil: "",
};

const classes = {
  headerRow: "mb-4 flex items-center justify-between",
  heading: "text-lg font-semibold",
  list: "space-y-2",
  couponRow:
    "flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-800",
  codeRow: "flex items-center gap-2",
  code: "font-mono font-bold",
  description: "text-sm text-gray-500",
  meta: "text-xs text-gray-400",
  deleteIcon: "size-4 text-gray-400 hover:text-red-500",
  form: "space-y-3",
  formGrid: "grid grid-cols-2 gap-3",
  submitButton: "w-full",
};

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CouponForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<ApiResponse<Coupon[]>>("/coupons")
      .then(({ data }) => setCoupons(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/coupons", {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      });
      toast.success("Coupon created");
      setModalOpen(false);
      setForm(INITIAL_FORM);
      load();
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not create coupon",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    await api.delete(`/coupons/${id}`);
    toast.success("Coupon deactivated");
    load();
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className={classes.headerRow}>
        <h2 className={classes.heading}>Coupons</h2>
        <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          New Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" />
      ) : (
        <div className={classes.list}>
          {coupons.map((c) => (
            <div key={c._id} className={classes.couponRow}>
              <div>
                <div className={classes.codeRow}>
                  <span className={classes.code}>{c.code}</span>
                  <Badge variant={c.isActive ? "green" : "gray"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className={classes.description}>{c.description}</p>
                <p className={classes.meta}>
                  {c.discountType === "flat"
                    ? formatCurrency(c.discountValue)
                    : `${c.discountValue}%`}{" "}
                  off · Used {c.usedCount} times · Expires{" "}
                  {formatDate(c.validUntil)}
                </p>
              </div>
              {c.isActive && (
                <button onClick={() => handleDeactivate(c._id)}>
                  <Trash2 className={classes.deleteIcon} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Coupon"
      >
        <form onSubmit={handleCreate} className={classes.form}>
          <Input
            label="Code"
            required
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className={classes.formGrid}>
            <Select
              label="Discount type"
              value={form.discountType}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountType: e.target.value as CouponDiscountType,
                })
              }
            >
              <option value="flat">Flat (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </Select>
            <Input
              label="Discount value"
              type="number"
              required
              value={form.discountValue}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
            />
          </div>
          <Input
            label="Minimum order value"
            type="number"
            value={form.minOrderValue}
            onChange={(e) =>
              setForm({ ...form, minOrderValue: e.target.value })
            }
          />
          <Input
            label="Valid until"
            type="date"
            required
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          />
          <Button
            type="submit"
            className={classes.submitButton}
            loading={saving}
          >
            Create Coupon
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;
