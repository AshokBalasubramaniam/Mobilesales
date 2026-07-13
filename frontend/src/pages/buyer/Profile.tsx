import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Camera, MapPin, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../app/hooks';
import { updateProfileThunk } from '../../features/auth/authSlice';
import { usersApi } from '../../api/users.api';
import { authApi } from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { PATHS } from '../../routes/paths';
import type { Address } from '../../types/models';

const ResendVerification = () => {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await authApi.resendVerification();
      toast.success('Verification email sent — check your inbox.');
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <button onClick={handleResend} disabled={sending} className="mt-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50">
      {sending ? 'Sending…' : 'Resend verification email'}
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
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>({ label: 'Home', line1: '', city: '', state: '', pincode: '' });
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses ?? []);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateProfileThunk(form)).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error((typeof err === 'string' && err) || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await usersApi.uploadAvatar(file);
      toast.success('Avatar updated — refresh to see changes');
    } catch {
      toast.error('Could not upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await usersApi.addAddress(newAddress);
      setAddresses(data.data);
      setAddressModalOpen(false);
      setNewAddress({ label: 'Home', line1: '', city: '', state: '', pincode: '' });
      toast.success('Address added');
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not add address');
    }
  };

  const handleRemoveAddress = async (id: string) => {
    const { data } = await usersApi.removeAddress(id);
    setAddresses(data.data);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <div className="relative">
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <label className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-brand-600 p-1.5 text-white">
            <Camera className="size-3.5" />
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={avatarUploading} />
          </label>
        </div>
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {!user.isEmailVerified && (
            <div>
              <p className="mt-1 text-xs text-amber-600">Email not verified</p>
              <ResendVerification />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-semibold">Basic Info</h2>
        <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
      </form>

      <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Addresses</h2>
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => setAddressModalOpen(true)}>
            Add Address
          </Button>
        </div>
        {addresses.length === 0 && <p className="text-sm text-gray-500">No saved addresses yet.</p>}
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div key={addr._id} className="flex items-start justify-between rounded-lg border border-gray-100 p-3 text-sm dark:border-gray-800">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 size-4 text-gray-400" />
                <div>
                  <p className="font-medium">{addr.label}</p>
                  <p className="text-gray-500">
                    {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              </div>
              <button onClick={() => handleRemoveAddress(addr._id)}>
                <Trash2 className="size-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="font-semibold">Change Password</h2>
        <Input
          label="Current password"
          type="password"
          required
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
        />
        <Input
          label="New password"
          type="password"
          required
          minLength={8}
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
        />
        <Button type="submit" loading={changingPassword}>
          Update Password
        </Button>
      </form>

      {isBuyer && (
        <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-900/20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-8 text-brand-600" />
            <div>
              <p className="font-semibold">Want to sell phones too?</p>
              <p className="text-sm text-gray-500">Get verified and start listing in minutes.</p>
            </div>
          </div>
          <Link to={PATHS.becomeSeller}>
            <Button>Become a Seller</Button>
          </Link>
        </div>
      )}

      <Modal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Add Address">
        <form onSubmit={handleAddAddress} className="space-y-3">
          <Input label="Label" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
          <Input label="Address line 1" required value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <Input label="City" required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
            <Input label="State" required value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
            <Input
              label="Pincode"
              required
              maxLength={6}
              value={newAddress.pincode}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
            />
          </div>
          <Button type="submit" className="w-full">
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
