import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import clsx from "clsx";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  ShieldCheck,
  Heart,
  MapPin,
  Package,
  Phone,
  Plus,
  Star,
  Ticket,
  Trash2,
  User as UserIcon,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { store } from "../../app/store";
import { updateProfileThunk } from "../../features/auth/thunks";
import { setUser } from "../../features/auth/slice";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import Modal from "../../components/common/Modal";
import Verification from "../seller/Verification";
import EmailCodeVerifier from "../../components/auth/EmailCodeVerifier";
import { PATHS } from "../../routes/paths";
import type { Address, User } from "../../types/models";

const classes = {
  container: "space-y-5",
  statsGrid: "stagger grid grid-cols-2 gap-3 xl:grid-cols-4",
  statCard:
    "flex items-center gap-3.5 rounded-lg border px-4 py-4 transition-transform hover:-translate-y-0.5",
  statIconTile: "flex size-11 shrink-0 items-center justify-center rounded-lg",
  statIcon: "size-5",
  statBody: "min-w-0 flex-1",
  statValue: "font-display text-3xl leading-none font-black text-gray-900",
  statLabel: "mt-0.5 text-xs text-gray-500",
  statArrow: "size-4 shrink-0",
  profileCard:
    "relative flex items-center gap-5 overflow-hidden rounded-lg border border-gray-200 bg-white px-6 py-5",
  profileGlow:
    "pointer-events-none absolute -right-8 -bottom-8 size-40 rounded-full bg-[radial-gradient(circle,var(--color-brand-100),transparent_70%)]",
  avatarWrapper: "relative shrink-0",
  avatarUploadLabel:
    "absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200",
  cameraIcon: "size-3.5",
  userName: "font-display text-2xl font-extrabold tracking-wide text-gray-900",
  userEmail: "mb-1.5 text-sm text-gray-500",
  verifyRow: "flex flex-wrap items-center gap-2.5",
  emailNotVerifiedBadge:
    "rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600",
  section: "rounded-lg border border-gray-200 bg-white px-6 py-5",
  sectionHeader: "mb-4 flex flex-wrap items-start justify-between gap-3",
  sectionHeading: "flex items-center gap-2.5",
  sectionIconTile:
    "flex size-9 items-center justify-center rounded-md bg-brand-100 text-brand-700",
  sectionIcon: "size-4",
  sectionTitle: "font-display text-base font-bold text-gray-900",
  sectionSubtitle: "text-xs text-gray-500",
  basicInfoGrid: "grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_1fr_auto]",
  primaryButton: "font-display font-bold tracking-wider uppercase",
  emptyAddresses:
    "flex items-center justify-center gap-3 rounded border border-dashed border-gray-300 px-6 py-6 text-left",
  emptyIcon: "size-6 shrink-0 text-gray-300",
  emptyTitle: "text-sm font-semibold text-gray-400",
  emptyText: "text-xs text-gray-400",
  addressesList: "grid grid-cols-1 gap-3 md:grid-cols-2",
  addressItem:
    "flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-4 text-sm",
  addressItemContent: "flex gap-2.5",
  mapPinIcon: "mt-0.5 size-4 text-brand-600",
  addressLabel: "font-semibold",
  addressDetail: "text-gray-500",
  trashIcon: "size-4 text-gray-400 hover:text-red-500",
  sellerBanner:
    "flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-6 py-5",
  sellerBannerContent: "flex items-center gap-3.5",
  sellerBannerIconTile:
    "flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700",
  sellerBannerIcon: "size-5",
  promoTitle: "font-display text-base font-extrabold tracking-wide text-gray-900",
  promoDescription: "text-xs text-gray-500",
  modalForm: "space-y-3",
  modalGrid: "grid grid-cols-3 gap-2",
  saveAddressButton: "w-full",
};

interface BuyerStats {
  orders: number;
  wishlist: number;
  reviews: number;
  activeCoupons: number;
}

const STAT_CARDS: {
  key: keyof BuyerStats;
  label: string;
  icon: LucideIcon;
  to: string;
  card: string;
  tile: string;
  arrow: string;
}[] = [
  {
    key: "orders",
    label: "Total Orders",
    icon: Package,
    to: PATHS.buyer.orders,
    card: "border-green-200 bg-green-50",
    tile: "bg-green-100 text-green-600",
    arrow: "text-green-500",
  },
  {
    key: "wishlist",
    label: "Wishlist Items",
    icon: Heart,
    to: PATHS.buyer.wishlist,
    card: "border-red-200 bg-red-50",
    tile: "bg-red-100 text-red-500",
    arrow: "text-red-500",
  },
  {
    key: "activeCoupons",
    label: "Active Coupons",
    icon: Ticket,
    to: PATHS.buyer.coupons,
    card: "border-blue-200 bg-blue-50",
    tile: "bg-blue-100 text-blue-500",
    arrow: "text-blue-500",
  },
  {
    key: "reviews",
    label: "My Reviews",
    icon: Star,
    to: PATHS.buyer.reviews,
    card: "border-amber-200 bg-amber-50",
    tile: "bg-amber-100 text-amber-500",
    arrow: "text-amber-500",
  },
];

export interface SectionProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}

const Section = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: SectionProps) => (
  <div className={classes.section}>
    <div className={classes.sectionHeader}>
      <div className={classes.sectionHeading}>
        <span className={classes.sectionIconTile}>
          <Icon className={classes.sectionIcon} />
        </span>
        <div>
          <h2 className={classes.sectionTitle}>{title}</h2>
          <p className={classes.sectionSubtitle}>{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// Backend validation errors come back as { message: "Validation failed",
// errors: [...] } — show the specific reasons instead of the generic message.
const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (!isAxiosError<{ message?: string; errors?: string[] }>(err))
    return fallback;
  const data = err.response?.data;
  if (data?.errors?.length) return data.errors.join(" • ");
  return data?.message || fallback;
};

interface NewAddressForm {
  label: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

const Profile = () => {
  const { user, isAdmin } = useAuth();
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
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<BuyerStats>>("/dashboard/buyer")
      .then(({ data }) => setStats(data.data))
      .catch(() => {});
  }, []);

  // Addresses are read straight from the session user (no local copy that
  // can go stale) — refresh it from the server whenever Profile opens.
  useEffect(() => {
    api
      .get<ApiResponse<User>>("/auth/me")
      .then(({ data }) => dispatch(setUser(data.data)))
      .catch(() => {});
  }, [dispatch]);

  if (!user) return null;

  const addresses = user.addresses ?? [];

  const verificationStatus =
    user.sellerProfile?.verificationStatus || "not_submitted";
  // Once documents are in (pending/approved) — or the user opened the upload
  // form — show the verification card instead of the promo banner.
  const showVerificationCard =
    verificationOpen ||
    verificationStatus === "pending" ||
    verificationStatus === "approved";

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
    // Backend (user.validation.ts#addAddress) only accepts a 6-digit pincode
    if (!/^\d{6}$/.test(newAddress.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    try {
      const { data } = await api.post<ApiResponse<Address[]>>(
        "/users/me/addresses",
        newAddress,
      );
      dispatch(setUser({ ...user, addresses: data.data }));
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
      toast.error(getApiErrorMessage(err, "Could not add address"));
    }
  };

  const handleRemoveAddress = async (id: string) => {
    const { data } = await api.delete<ApiResponse<Address[]>>(
      `/users/me/addresses/${id}`,
    );
    dispatch(setUser({ ...user, addresses: data.data }));
  };

  return (
    <div className={classes.container}>
      {stats && (
        <div className={classes.statsGrid}>
          {STAT_CARDS.map(({ key, label, icon: Icon, to, card, tile, arrow }) => (
            <Link key={key} to={to} className={clsx(classes.statCard, card)}>
              <span className={clsx(classes.statIconTile, tile)}>
                <Icon className={classes.statIcon} />
              </span>
              <div className={classes.statBody}>
                <p className={classes.statValue}>{stats[key]}</p>
                <p className={classes.statLabel}>{label}</p>
              </div>
              <ChevronRight className={clsx(classes.statArrow, arrow)} />
            </Link>
          ))}
        </div>
      )}

      <div className={classes.profileCard}>
        <span className={classes.profileGlow} />
        <div className={classes.avatarWrapper}>
          <Avatar src={user.avatar} name={user.name} size="lg" />
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
            <div className={classes.verifyRow}>
              <span className={classes.emailNotVerifiedBadge}>
                Email not verified
              </span>
              <EmailCodeVerifier trigger="link" />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveProfile}>
        <Section
          title="Basic Information"
          subtitle="Update your personal details."
          icon={UserIcon}
        >
          <div className={classes.basicInfoGrid}>
            <Input
              label="Full name"
              icon={UserIcon}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Phone"
              icon={Phone}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Button
              type="submit"
              loading={saving}
              className={classes.primaryButton}
            >
              Save Changes
            </Button>
          </div>
        </Section>
      </form>

      <Section
        title="Addresses"
        subtitle="Manage your shipping addresses."
        icon={MapPin}
        action={
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => setAddressModalOpen(true)}
          >
            Add Address
          </Button>
        }
      >
        {addresses.length === 0 ? (
          <div className={classes.emptyAddresses}>
            <MapPin className={classes.emptyIcon} />
            <div>
              <p className={classes.emptyTitle}>No saved addresses yet.</p>
              <p className={classes.emptyText}>
                Add a delivery address to make checkout faster.
              </p>
            </div>
          </div>
        ) : (
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
                <button
                  onClick={() => handleRemoveAddress(addr._id)}
                  aria-label="Remove address"
                >
                  <Trash2 className={classes.trashIcon} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {!isAdmin &&
        (showVerificationCard ? (
          <Section
            title="Seller Verification"
            subtitle="Upload photos of your ID. An admin verifies them before you can sell."
            icon={ShieldCheck}
          >
            <Verification embedded />
          </Section>
        ) : (
          <div className={classes.sellerBanner}>
            <div className={classes.sellerBannerContent}>
              <span className={classes.sellerBannerIconTile}>
                <Zap className={classes.sellerBannerIcon} />
              </span>
              <div>
                <p className={classes.promoTitle}>
                  {verificationStatus === "rejected"
                    ? "Your seller verification was rejected"
                    : "Want to sell your devices?"}
                </p>
                <p className={classes.promoDescription}>
                  {verificationStatus === "rejected"
                    ? "Upload clearer photos of your documents and resubmit."
                    : "Upload your ID photos. Once an admin verifies them you can start selling."}
                </p>
              </div>
            </div>
            <Button
              icon={ArrowRight}
              className={classes.primaryButton}
              onClick={() => setVerificationOpen(true)}
            >
              {verificationStatus === "rejected"
                ? "Resubmit Documents"
                : "Become a Seller"}
            </Button>
          </div>
        ))}

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
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              placeholder="6 digits"
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
