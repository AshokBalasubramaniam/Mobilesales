import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Camera, MapPin, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { store } from "../../app/store";
import { updateProfileThunk } from "../../features/auth/thunks";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import Modal from "../../components/common/Modal";
import { PATHS } from "../../routes/paths";
import type { Address } from "../../types/models";

const classes = {
  resendButton:
    "mt-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50",
  container: "space-y-6",
  avatarCard:
    "flex items-center gap-4 rounded-xl border border-gray-200 p-6",
  avatarWrapper: "relative",
  avatarUploadLabel:
    "absolute right-0 bottom-0 cursor-pointer rounded-full bg-brand-600 p-1.5 text-white",
  cameraIcon: "size-3.5",
  userName: "font-semibold",
  userEmail: "text-sm text-gray-500",
  emailNotVerifiedText: "mt-1 text-xs text-amber-600",
  formPanel:
    "space-y-4 rounded-xl border border-gray-200 p-6",
  sectionTitle: "font-semibold",
  addressesPanel: "rounded-xl border border-gray-200 p-6",
  addressesHeader: "mb-3 flex items-center justify-between",
  noAddressesText: "text-sm text-gray-500",
  addressesList: "space-y-2",
  addressItem:
    "flex items-start justify-between rounded-lg border border-gray-100 p-3 text-sm",
  addressItemContent: "flex gap-2",
  mapPinIcon: "mt-0.5 size-4 text-gray-400",
  addressLabel: "font-medium",
  addressDetail: "text-gray-500",
  trashIcon: "size-4 text-gray-400 hover:text-red-500",
  becomeSellerBanner:
    "flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-6",
  becomeSellerContent: "flex items-center gap-3",
  shieldIcon: "size-8 text-brand-600",
  promoTitle: "font-semibold",
  promoDescription: "text-sm text-gray-500",
  modalForm: "space-y-3",
  modalGrid: "grid grid-cols-3 gap-2",
  saveAddressButton: "w-full",
};

const ResendVerification = () => {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post("/auth/resend-verification");
      toast.success("Verification email sent — check your inbox.");
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not send verification email",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handleResend}
      disabled={sending}
      className={classes.resendButton}
    >
      {sending ? "Sending…" : "Resend verification email"}
    </button>
  );
};

interface NewAddressForm {
  label: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

const Profile = () => {
  const { user, isBuyer } = useAuth();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>({
    label: "Home",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses ?? []);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const user = await dispatch(updateProfileThunk(form));
    if (user) {
      toast.success("Profile updated");
    } else {
      toast.error(store.getState().auth.error || "Could not update profile");
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const avatarForm = new FormData();
      avatarForm.append("avatar", file);
      await api.post("/users/me/avatar", avatarForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Avatar updated — refresh to see changes");
    } catch {
      toast.error("Could not upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post<ApiResponse<Address[]>>(
        "/users/me/addresses",
        newAddress,
      );
      setAddresses(data.data);
      setAddressModalOpen(false);
      setNewAddress({
        label: "Home",
        line1: "",
        city: "",
        state: "",
        pincode: "",
      });
      toast.success("Address added");
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not add address",
      );
    }
  };

  const handleRemoveAddress = async (id: string) => {
    const { data } = await api.delete<ApiResponse<Address[]>>(
      `/users/me/addresses/${id}`,
    );
    setAddresses(data.data);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", passwordForm);
      toast.success("Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.avatarCard}>
        <div className={classes.avatarWrapper}>
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <label className={classes.avatarUploadLabel}>
            <Camera className={classes.cameraIcon} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>
        </div>
        <div>
          <p className={classes.userName}>{user.name}</p>
          <p className={classes.userEmail}>{user.email}</p>
          {!user.isEmailVerified && (
            <div>
              <p className={classes.emailNotVerifiedText}>Email not verified</p>
              <ResendVerification />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className={classes.formPanel}>
        <h2 className={classes.sectionTitle}>Basic Info</h2>
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
      </form>

      <div className={classes.addressesPanel}>
        <div className={classes.addressesHeader}>
          <h2 className={classes.sectionTitle}>Addresses</h2>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => setAddressModalOpen(true)}
          >
            Add Address
          </Button>
        </div>
        {addresses.length === 0 && (
          <p className={classes.noAddressesText}>No saved addresses yet.</p>
        )}
        <div className={classes.addressesList}>
          {addresses.map((addr) => (
            <div key={addr._id} className={classes.addressItem}>
              <div className={classes.addressItemContent}>
                <MapPin className={classes.mapPinIcon} />
                <div>
                  <p className={classes.addressLabel}>{addr.label}</p>
                  <p className={classes.addressDetail}>
                    {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              </div>
              <button onClick={() => handleRemoveAddress(addr._id)}>
                <Trash2 className={classes.trashIcon} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleChangePassword} className={classes.formPanel}>
        <h2 className={classes.sectionTitle}>Change Password</h2>
        <Input
          label="Current password"
          type="password"
          required
          value={passwordForm.currentPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              currentPassword: e.target.value,
            })
          }
        />
        <Input
          label="New password"
          type="password"
          required
          minLength={8}
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
          }
        />
        <Button type="submit" loading={changingPassword}>
          Update Password
        </Button>
      </form>

      {isBuyer && (
        <div className={classes.becomeSellerBanner}>
          <div className={classes.becomeSellerContent}>
            <ShieldCheck className={classes.shieldIcon} />
            <div>
              <p className={classes.promoTitle}>Want to sell phones too?</p>
              <p className={classes.promoDescription}>
                Get verified and start listing in minutes.
              </p>
            </div>
          </div>
          <Link to={PATHS.becomeSeller}>
            <Button>Become a Seller</Button>
          </Link>
        </div>
      )}

      <Modal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add Address"
      >
        <form onSubmit={handleAddAddress} className={classes.modalForm}>
          <Input
            label="Label"
            value={newAddress.label}
            onChange={(e) =>
              setNewAddress({ ...newAddress, label: e.target.value })
            }
          />
          <Input
            label="Address line 1"
            required
            value={newAddress.line1}
            onChange={(e) =>
              setNewAddress({ ...newAddress, line1: e.target.value })
            }
          />
          <div className={classes.modalGrid}>
            <Input
              label="City"
              required
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
            />
            <Input
              label="State"
              required
              value={newAddress.state}
              onChange={(e) =>
                setNewAddress({ ...newAddress, state: e.target.value })
              }
            />
            <Input
              label="Pincode"
              required
              maxLength={6}
              value={newAddress.pincode}
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  pincode: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>
          <Button type="submit" className={classes.saveAddressButton}>
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
