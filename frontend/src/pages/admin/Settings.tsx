import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import {
  Mail,
  Image,
  Palette,
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Info,
  ImageOff,
  MessageCircle,
  Lightbulb,
  KeyRound,
} from "lucide-react";
import api from "../../api/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import type { ApiResponse } from "../../types/api";

interface SettingsData {
  emailFrom: string;
  heroBannerUrl: string | null;
  heroBannerSize: number;
}

const SETTINGS_NAV = [
  {
    id: "email",
    icon: Mail,
    label: "Email Settings",
    sub: "Manage outgoing emails",
    available: true,
  },
  {
    id: "banner",
    icon: Image,
    label: "Homepage Banner",
    sub: "Update hero section",
    available: true,
  },
  {
    id: "appearance",
    icon: Palette,
    label: "Appearance",
    sub: "Customize look & feel",
    available: false,
  },
  {
    id: "general",
    icon: SettingsIcon,
    label: "General",
    sub: "Account & password",
    available: true,
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    sub: "Manage alerts",
    available: false,
  },
  {
    id: "security",
    icon: Shield,
    label: "Security",
    sub: "Password & access",
    available: false,
  },
  {
    id: "payment",
    icon: CreditCard,
    label: "Payment Settings",
    sub: "Configure payments",
    available: false,
  },
  {
    id: "about",
    icon: Info,
    label: "About",
    sub: "Platform information",
    available: false,
  },
] as const;

type SectionId = (typeof SETTINGS_NAV)[number]["id"];

const classes = {
  title: "mb-1 text-2xl font-bold text-gray-900",
  subtitle: "mb-6 text-sm text-gray-500",
  layout: "flex flex-wrap gap-5 lg:flex-nowrap",
  nav: "h-fit w-full shrink-0 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm lg:w-56",
  navItem:
    "mb-0.5 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
  navItemActive: "border border-brand-100 bg-brand-50",
  navItemInactive: "hover:bg-gray-50",
  navIconWrap: "flex size-8 shrink-0 items-center justify-center rounded-lg",
  navIconWrapActive: "bg-brand-100 text-brand-700",
  navIconWrapInactive: "bg-gray-100 text-gray-500",
  navLabel: "truncate text-xs font-semibold",
  navLabelActive: "text-brand-800",
  navLabelInactive: "text-gray-800",
  navSub: "truncate text-[10px] text-gray-400",
  main: "min-w-0 flex-1 space-y-4",
  sectionCard: "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm",
  sectionHeader: "mb-5 flex items-start gap-4",
  sectionIconWrap:
    "flex size-10 shrink-0 items-center justify-center rounded-xl",
  sectionTitle: "text-base font-semibold text-gray-900",
  sectionDescription: "mt-0.5 text-xs text-gray-500",
  form: "space-y-4",
  submitRow: "flex justify-end",
  savedBanner:
    "mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-700",
  bannerPreviewWrap:
    "mb-4 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50",
  bannerPreviewImg: "object-contain",
  bannerActions: "flex items-center gap-2",
  bannerSizeRow: "mb-4 flex items-end gap-2",
  accountRow: "mb-5 grid grid-cols-2 gap-4",
  accountLabel: "text-xs font-medium text-gray-500",
  accountValue: "mt-1 text-sm font-medium text-gray-900",
  divider: "my-6 border-t border-gray-100",
  aside: "w-full shrink-0 space-y-4 lg:w-64",
  asideCard: "rounded-2xl border border-gray-100 bg-white p-4 shadow-sm",
  asideHeaderRow: "mb-3 flex items-center gap-2",
  asideIconWrap: "flex size-6 items-center justify-center rounded-lg bg-gray-100",
  asideTitle: "text-xs font-semibold text-gray-900",
  asideSubtitle: "text-[10px] text-gray-400",
  livePreview:
    "relative flex h-28 items-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#0a1a0b_0%,#0d2110_40%,#0f2a14_70%,#0a1a0b_100%)]",
  livePreviewImg: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain",
  tipsCard: "rounded-2xl border border-green-100 bg-green-50 p-4",
  tipsHeaderRow: "mb-3 flex items-center gap-2",
  tipsTitle: "text-xs font-semibold text-green-800",
  tipsList: "space-y-2",
  tipItem: "flex items-start gap-2 text-[11px] text-green-700",
  helpCard: "rounded-2xl border border-blue-100 bg-blue-50 p-4",
  helpHeaderRow: "mb-2 flex items-center gap-2",
  helpIconWrap: "flex size-6 items-center justify-center rounded-lg bg-blue-100",
  helpTitle: "text-xs font-semibold text-blue-800",
  helpText: "mb-3 text-[11px] text-blue-600",
  helpButton:
    "flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100",
};

const TIPS = [
  "Use high quality images (PNG, JPG, or WebP)",
  "Keep the file size reasonable for fast page loads",
  "Keep the subject centered — it's shown at a fixed size",
  "Use clear, attractive visuals for better engagement",
];

const Settings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("email");
  const [emailFrom, setEmailFrom] = useState("");
  const [heroBannerUrl, setHeroBannerUrl] = useState<string | null>(null);
  const [heroBannerSize, setHeroBannerSize] = useState(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSizeSaving, setBannerSizeSaving] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<SettingsData>>("/admin/settings")
      .then(({ data }) => {
        setEmailFrom(data.data.emailFrom);
        setHeroBannerUrl(data.data.heroBannerUrl);
        setHeroBannerSize(data.data.heroBannerSize);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/admin/settings", { emailFrom });
      toast.success("Settings updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not update settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBannerChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBannerUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const uploadRes = await api.post<ApiResponse<{ url: string }>>(
        "/upload/image",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const url = uploadRes.data.data.url;
      await api.patch("/admin/settings", { heroBannerUrl: url });
      setHeroBannerUrl(url);
      toast.success("Hero banner updated");
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not upload banner image",
      );
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerSizeSave = async () => {
    setBannerSizeSaving(true);
    try {
      await api.patch("/admin/settings", { heroBannerSize });
      toast.success("Banner size updated");
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not update banner size",
      );
    } finally {
      setBannerSizeSaving(false);
    }
  };

  const handleBannerRemove = async () => {
    setBannerUploading(true);
    try {
      await api.patch("/admin/settings", { heroBannerUrl: "" });
      setHeroBannerUrl(null);
      toast.success("Hero banner removed");
    } catch {
      toast.error("Could not remove banner image");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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

  if (loading) return <Spinner full />;

  return (
    <div>
      <h1 className={classes.title}>Settings</h1>
      <p className={classes.subtitle}>
        Manage your platform preferences and customize your marketplace.
      </p>

      <div className={classes.layout}>
        <div className={classes.nav}>
          {SETTINGS_NAV.map(({ id, icon: Icon, label, sub }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`${classes.navItem} ${isActive ? classes.navItemActive : classes.navItemInactive}`}
              >
                <span
                  className={`${classes.navIconWrap} ${isActive ? classes.navIconWrapActive : classes.navIconWrapInactive}`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`${classes.navLabel} block ${isActive ? classes.navLabelActive : classes.navLabelInactive}`}
                  >
                    {label}
                  </span>
                  <span className={`${classes.navSub} block`}>{sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className={classes.main}>
          {activeSection === "email" && (
            <div className={classes.sectionCard}>
              <div className={classes.sectionHeader}>
                <div className={`${classes.sectionIconWrap} bg-green-50`}>
                  <Mail className="size-4.5 text-green-600" />
                </div>
                <div>
                  <h3 className={classes.sectionTitle}>Email Settings</h3>
                  <p className={classes.sectionDescription}>
                    The email address that outgoing emails — verification,
                    password reset, notifications — are sent from.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className={classes.form}>
                <Input
                  label="Email From Address"
                  type="email"
                  placeholder="no-reply@mobilesales.local"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  required
                />
                {saved && (
                  <p className={classes.savedBanner}>
                    ✓ This email will be used for all system emails.
                  </p>
                )}
                <div className={classes.submitRow}>
                  <Button type="submit" loading={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeSection === "banner" && (
            <div className={classes.sectionCard}>
              <div className={classes.sectionHeader}>
                <div className={`${classes.sectionIconWrap} bg-blue-50`}>
                  <Image className="size-4.5 text-blue-600" />
                </div>
                <div>
                  <h3 className={classes.sectionTitle}>Homepage Banner</h3>
                  <p className={classes.sectionDescription}>
                    The image shown in the Home page hero banner. PNG, JPG, or
                    WebP.
                  </p>
                </div>
              </div>
              <div className={classes.bannerPreviewWrap}>
                {heroBannerUrl ? (
                  <img
                    src={heroBannerUrl}
                    alt="Hero banner"
                    className={classes.bannerPreviewImg}
                    style={{ width: heroBannerSize, height: heroBannerSize }}
                  />
                ) : (
                  <EmptyState icon={ImageOff} title="No banner image set" />
                )}
              </div>
              <div className={classes.bannerSizeRow}>
                <Input
                  label="Banner size (px)"
                  id="heroBannerSize"
                  type="number"
                  min={20}
                  max={1000}
                  value={heroBannerSize}
                  onChange={(e) => setHeroBannerSize(Number(e.target.value))}
                />
                <Button loading={bannerSizeSaving} onClick={handleBannerSizeSave}>
                  Save Size
                </Button>
              </div>
              <div className={classes.bannerActions}>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleBannerChange}
                  disabled={bannerUploading}
                />
                <Button
                  loading={bannerUploading}
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {heroBannerUrl ? "Replace Image" : "Upload Image"}
                </Button>
                {heroBannerUrl && (
                  <Button
                    variant="secondary"
                    onClick={handleBannerRemove}
                    loading={bannerUploading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeSection === "general" && (
            <div className={classes.sectionCard}>
              <div className={classes.sectionHeader}>
                <div className={`${classes.sectionIconWrap} bg-gray-100`}>
                  <SettingsIcon className="size-4.5 text-gray-600" />
                </div>
                <div>
                  <h3 className={classes.sectionTitle}>General</h3>
                  <p className={classes.sectionDescription}>
                    Your admin account details and password.
                  </p>
                </div>
              </div>

              <div className={classes.accountRow}>
                <div>
                  <p className={classes.accountLabel}>Username</p>
                  <p className={classes.accountValue}>{user?.name}</p>
                </div>
                <div>
                  <p className={classes.accountLabel}>Email</p>
                  <p className={classes.accountValue}>{user?.email}</p>
                </div>
              </div>

              <div className={classes.divider} />

              <div className={classes.sectionHeader}>
                <div className={`${classes.sectionIconWrap} bg-amber-50`}>
                  <KeyRound className="size-4.5 text-amber-600" />
                </div>
                <div>
                  <h3 className={classes.sectionTitle}>Change Password</h3>
                  <p className={classes.sectionDescription}>
                    Update the password used to sign in to this admin account.
                  </p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} className={classes.form}>
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
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <div className={classes.submitRow}>
                  <Button type="submit" loading={changingPassword}>
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeSection !== "email" &&
            activeSection !== "banner" &&
            activeSection !== "general" && (
              <div className={classes.sectionCard}>
                <EmptyState
                  icon={
                    SETTINGS_NAV.find((s) => s.id === activeSection)?.icon
                  }
                  title="Coming soon"
                  description="This settings section isn't available yet."
                />
              </div>
            )}
        </div>

        {activeSection === "banner" && (
          <div className={classes.aside}>
          <div className={classes.asideCard}>
            <div className={classes.asideHeaderRow}>
              <span className={classes.asideIconWrap}>
                <Image className="size-3.5 text-gray-500" />
              </span>
              <div>
                <p className={classes.asideTitle}>Preview</p>
                <p className={classes.asideSubtitle}>
                  How the banner looks on the homepage.
                </p>
              </div>
            </div>
            <div className={classes.livePreview}>
              {heroBannerUrl && (
                <img
                  src={heroBannerUrl}
                  alt=""
                  className={classes.livePreviewImg}
                  style={{ width: heroBannerSize, height: heroBannerSize }}
                />
              )}
            </div>
          </div>

          <div className={classes.tipsCard}>
            <div className={classes.tipsHeaderRow}>
              <Lightbulb className="size-3.5 text-green-600" />
              <span className={classes.tipsTitle}>Tips</span>
            </div>
            <ul className={classes.tipsList}>
              {TIPS.map((tip) => (
                <li key={tip} className={classes.tipItem}>
                  <span className="mt-0.5 text-green-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className={classes.helpCard}>
            <div className={classes.helpHeaderRow}>
              <span className={classes.helpIconWrap}>
                <Info className="size-3.5 text-blue-600" />
              </span>
              <span className={classes.helpTitle}>Need help?</span>
            </div>
            <p className={classes.helpText}>
              If you need assistance with settings, contact our support team.
            </p>
            <a
              href="mailto:support@mobilesales.local"
              className={classes.helpButton}
            >
              <MessageCircle className="size-3.5" /> Contact Support
            </a>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
