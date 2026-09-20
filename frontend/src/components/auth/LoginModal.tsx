import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Lock,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
  Tag,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import GoogleLoginButton from "./GoogleLoginButton";
import { useAppDispatch } from "../../app/hooks";
import { store } from "../../app/store";
import {
  requestOtp,
  verifyOtp,
  completeOtpRegistration,
} from "../../features/auth/thunks";
import { getDashboardPath, PATHS } from "../../routes/paths";
import type { LoginModalIntent } from "../../features/ui/slice";
import type { User } from "../../types/models";
import heroDevices from "../../assets/hero-devices.png";

export interface LoginModalProps {
  intent: LoginModalIntent | null;
  onClose: () => void;
}

type LoginStep = "phone" | "otp" | "register";

const FEATURES = [
  { icon: ShieldCheck, title: "Secure & Trusted", sub: "100% safe transactions" },
  { icon: Tag, title: "Best Deals", sub: "Find the best prices" },
  { icon: MessageCircle, title: "Chat & Connect", sub: "Talk to buyers & sellers" },
];

const STATS = [
  { icon: Users, value: "50K+", label: "Happy Customers" },
  { icon: Package, value: "15K+", label: "Verified Sellers" },
  { icon: Star, value: "4.8", label: "Customer Rating" },
];

const classes = {
  panel: "!p-0 !max-w-4xl w-full overflow-hidden",
  closeButton:
    "absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors",
  closeIcon: "size-5",
  body: "flex w-full",

  brandPanel:
    "hidden w-[45%] shrink-0 flex-col overflow-hidden bg-gradient-to-br from-[#1a5c30] via-[#1e7038] to-[#145025] p-8 relative md:flex",
  brandCircleTop: "absolute -top-16 -right-16 size-64 rounded-full bg-white/5",
  brandCircleBottom: "absolute bottom-28 -left-10 size-48 rounded-full bg-white/5",
  brandLogoRow: "relative z-10 mb-8 flex items-center gap-3",
  brandLogoMark:
    "flex size-10 items-center justify-center rounded-lg bg-white text-lg font-black text-[#1a5c30]",
  brandLogoName: "text-lg leading-none font-bold text-white",
  brandLogoTagline: "text-[10px] font-semibold tracking-widest text-[#4ade80]",
  brandHeadingBlock: "relative z-10 mb-4",
  brandHeadingWhite: "text-3xl leading-tight font-extrabold text-white",
  brandHeadingAccent: "text-3xl leading-tight font-extrabold text-[#4ade80]",
  brandSubheading: "mt-3 text-sm leading-relaxed text-white/70",
  brandFeaturesList: "relative z-10 mb-4 space-y-3",
  brandFeatureItem: "flex items-center gap-3",
  brandFeatureIconWrap:
    "flex size-9 shrink-0 items-center justify-center rounded-full border border-[#4ade80]/40 bg-[#4ade80]/20 text-[#4ade80]",
  brandFeatureIcon: "size-4",
  brandFeatureTitle: "text-sm font-semibold text-white",
  brandFeatureSub: "text-xs text-white/60",
  brandCursive:
    "relative z-10 mb-2 pr-4 text-right text-sm font-light text-[#4ade80] italic",
  brandImageStage: "relative z-10 flex flex-1 items-end",
  brandImage: "max-h-40 w-full object-contain drop-shadow-xl",
  brandStatsRow:
    "relative z-10 mt-2 flex justify-between border-t border-white/10 pt-4",
  brandStatItem: "text-center",
  brandStatIcon: "mx-auto mb-0.5 size-4 text-white/80",
  brandStatValue: "text-sm font-bold text-white",
  brandStatLabel: "text-[10px] text-white/50",

  formPanel:
    "flex min-w-0 flex-1 flex-col justify-center px-8 py-10 sm:px-10 sm:py-12",
  title: "mb-1 text-center text-2xl font-bold text-[#1a2336]",
  subtitle: "mb-8 text-center text-sm text-gray-400",
  subtitleBrand: "font-semibold text-gray-600",

  fieldLabel: "mb-2 block text-sm font-semibold text-[#1a2336]",
  phoneField:
    "mb-3 flex items-center overflow-hidden rounded-xl border border-gray-200 transition-all focus-within:border-[#1a7a3a] focus-within:ring-2 focus-within:ring-[#1a7a3a]/30",
  phonePrefix:
    "flex select-none items-center gap-2 border-r border-gray-200 bg-gray-50 px-3 py-3",
  phonePrefixFlag: "text-base",
  phonePrefixCode: "text-sm font-medium text-gray-700",
  phonePrefixChevron: "size-3 text-gray-400",
  phoneInput:
    "min-w-0 flex-1 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder-gray-400",

  altLink:
    "mb-6 flex items-center gap-1 text-sm font-semibold text-[#1a7a3a] hover:underline",
  altLinkIcon: "size-3.5",

  form: "min-w-0 space-y-4",
  submitButton:
    "w-full !rounded-xl !bg-[#1a7a3a] !py-3.5 text-base shadow-md shadow-green-900/20 hover:!bg-[#145e2c]",
  changePhoneButton:
    "w-full text-center text-xs text-gray-500 hover:underline",

  divider: "my-4 flex items-center gap-3 text-xs font-medium text-gray-400",
  dividerLine: "h-px flex-1 bg-gray-200",
  googleWrap: "mb-6",

  privacyNote:
    "mb-4 flex items-center justify-center gap-2 text-center text-xs text-gray-400",
  privacyIcon: "size-3.5",

  securityBadge: "flex items-center gap-3 rounded-xl bg-[#f0faf4] px-4 py-3",
  securityIconWrap:
    "flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1a7a3a]/10",
  securityIcon: "size-4 text-[#1a7a3a]",
  securityTitle: "text-sm font-semibold text-[#1a2336]",
  securitySub: "text-xs text-gray-400",
};

const LoginModal = ({ intent, onClose }: LoginModalProps) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const open = intent !== null;

  const reset = () => {
    setPhone("");
    setCode("");
    setName("");
    setPassword("");
    setFirebaseIdToken("");
    setStep("phone");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const redirectAfterLogin = (user: User) => {
    const targetPath = intent?.targetPath;
    reset();
    onClose();
    navigate(targetPath || getDashboardPath(user.role));
  };

  const goTo = (path: string) => {
    reset();
    onClose();
    navigate(path);
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sentPhone = await dispatch(requestOtp(phone));
    if (sentPhone) {
      toast.success("OTP sent to your phone");
      setStep("otp");
    } else {
      toast.error(store.getState().auth.error || "Could not send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(verifyOtp({ phone, code }));
    if (result?.status === "logged_in") {
      redirectAfterLogin(result.user);
    } else if (result?.status === "needs_registration") {
      setFirebaseIdToken(result.idToken);
      setStep("register");
    } else {
      toast.error(store.getState().auth.error || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleCompleteRegistration = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = await dispatch(
      completeOtpRegistration({
        idToken: firebaseIdToken,
        name,
        password,
        role: intent?.role || "buyer",
      }),
    );
    if (user) {
      redirectAfterLogin(user);
    } else {
      toast.error(store.getState().auth.error || "Could not create account");
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={handleClose} className={classes.panel}>
      <button
        onClick={handleClose}
        className={classes.closeButton}
        aria-label="Close"
      >
        <X className={classes.closeIcon} />
      </button>
      <div className={classes.body}>
        <div className={classes.brandPanel}>
          <div className={classes.brandCircleTop} />
          <div className={classes.brandCircleBottom} />

          <div className={classes.brandLogoRow}>
            <span className={classes.brandLogoMark}>M</span>
            <div>
              <p className={classes.brandLogoName}>MAPZHA</p>
              <p className={classes.brandLogoTagline}>ELECTRONICS MARKETPLACE</p>
            </div>
          </div>

          <div className={classes.brandHeadingBlock}>
            <h2 className={classes.brandHeadingWhite}>Buy. Sell.</h2>
            <h2 className={classes.brandHeadingAccent}>Connect.</h2>
            <p className={classes.brandSubheading}>
              India's trusted marketplace for new & second-hand devices.
            </p>
          </div>

          <div className={classes.brandFeaturesList}>
            {FEATURES.map((f) => (
              <div key={f.title} className={classes.brandFeatureItem}>
                <span className={classes.brandFeatureIconWrap}>
                  <f.icon className={classes.brandFeatureIcon} />
                </span>
                <div>
                  <p className={classes.brandFeatureTitle}>{f.title}</p>
                  <p className={classes.brandFeatureSub}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <p className={classes.brandCursive} style={{ fontFamily: "Georgia, serif" }}>
            Same Passion
            <br />
            New Possibilities
          </p>

          <div className={classes.brandImageStage}>
            <img
              src={heroDevices}
              alt="Electronics devices"
              className={classes.brandImage}
            />
          </div>

          <div className={classes.brandStatsRow}>
            {STATS.map((s) => (
              <div key={s.label} className={classes.brandStatItem}>
                <s.icon className={classes.brandStatIcon} />
                <p className={classes.brandStatValue}>{s.value}</p>
                <p className={classes.brandStatLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.formPanel}>
          <h2 className={classes.title}>Welcome back!</h2>
          <p className={classes.subtitle}>
            {step === "phone" && (
              <>
                Login to continue buying and selling on{" "}
                <span className={classes.subtitleBrand}>MAPZHA</span>.
              </>
            )}
            {step === "otp" && `Enter the 6-digit code sent to ${phone}`}
            {step === "register" &&
              (intent?.role === "seller"
                ? "New number — create your seller account to continue."
                : "New number — create your account to continue.")}
          </p>

          {step === "phone" && (
            <form onSubmit={handleRequestOtp} className={classes.form}>
              <label className={classes.fieldLabel}>Mobile number</label>
              <div className={classes.phoneField}>
                <span className={classes.phonePrefix}>
                  <span className={classes.phonePrefixFlag}>🇮🇳</span>
                  <span className={classes.phonePrefixCode}>+91</span>
                  <ChevronDown className={classes.phonePrefixChevron} />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Enter your mobile number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className={classes.phoneInput}
                />
              </div>

              <button
                type="button"
                onClick={() => goTo(PATHS.passwordLogin)}
                className={classes.altLink}
              >
                Use email instead
                <ChevronRight className={classes.altLinkIcon} />
              </button>

              <Button
                type="submit"
                className={classes.submitButton}
                icon={ArrowRight}
                loading={loading}
              >
                Send OTP
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className={classes.form}>
              <Input
                label="OTP Code"
                icon={Lock}
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button
                type="submit"
                className={classes.submitButton}
                icon={ArrowRight}
                loading={loading}
              >
                Verify & Login
              </Button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className={classes.changePhoneButton}
              >
                Change phone number
              </button>
            </form>
          )}

          {step === "register" && (
            <form onSubmit={handleCompleteRegistration} className={classes.form}>
              <Input
                label="Full name"
                icon={UserIcon}
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                icon={Lock}
                autoComplete="new-password"
                required
                minLength={8}
                hint="At least 8 characters, with uppercase, lowercase, a number & a symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                className={classes.submitButton}
                icon={ArrowRight}
                loading={loading}
              >
                Create account
              </Button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className={classes.changePhoneButton}
              >
                Change phone number
              </button>
            </form>
          )}

          <div className={classes.divider}>
            <div className={classes.dividerLine} /> OR{" "}
            <div className={classes.dividerLine} />
          </div>

          <div className={classes.googleWrap}>
            <GoogleLoginButton onSuccess={redirectAfterLogin} />
          </div>

          <p className={classes.privacyNote}>
            <Lock className={classes.privacyIcon} />
            We'll never share your information with anyone.
          </p>

          <div className={classes.securityBadge}>
            <span className={classes.securityIconWrap}>
              <ShieldCheck className={classes.securityIcon} />
            </span>
            <div>
              <p className={classes.securityTitle}>Secure · Fast · Trusted</p>
              <p className={classes.securitySub}>Your data is safe with us</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
