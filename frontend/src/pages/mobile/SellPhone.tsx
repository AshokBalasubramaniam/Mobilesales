import {
  useState,
  type ComponentType,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Clock,
  IndianRupee,
  Lightbulb,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import WizardProgress from "../../components/sell/WizardProgress";
import StepIdentity, {
  type SellPhoneForm,
} from "../../components/sell/StepIdentity";
import StepCondition from "../../components/sell/StepCondition";
import StepLocation from "../../components/sell/StepLocation";
import StepMedia from "../../components/sell/StepMedia";
import StepPricing from "../../components/sell/StepPricing";
import Button from "../../components/common/Button";
import EmailVerificationNotice from "../../components/auth/EmailVerificationNotice";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import type { CreateMobilePayload } from "../../types/mobile";
import { PATHS } from "../../routes/paths";
import type { Mobile, MobileCondition } from "../../types/models";
import {
  STORAGE_RAM_CATEGORIES,
  BATTERY_HEALTH_CATEGORIES,
  IMEI_CATEGORIES,
} from "../../utils/constants";

const STEPS = ["Device", "Condition", "Location", "Photos", "Price"];

const INITIAL_FORM: SellPhoneForm = {
  category: "",
  brand: "",
  model: "",
  storage: "",
  ram: "",
  color: "",
  condition: "",
  batteryHealth: 80,
  imei: "",
  warranty: { hasWarranty: false, expiryDate: "" },
  hasRepairHistory: false,
  repairNote: "",
  originalBoxAvailable: false,
  accessoriesIncluded: [],
  location: {
    state: "",
    city: "",
    pincode: "",
    lat: undefined,
    lng: undefined,
  },
  photos: [],
  video: null,
  purchaseBill: null,
  mrp: "",
  price: "",
  negotiable: true,
  description: "",
};

const validateStep = (step: number, form: SellPhoneForm): string | null => {
  switch (step) {
    case 0: {
      if (!form.category) return "Please select a category";
      if (!form.brand || !form.model) return "Please fill in brand and model";
      if (
        STORAGE_RAM_CATEGORIES.includes(form.category) &&
        (!form.storage || !form.ram)
      )
        return "Please fill in storage and RAM";
      return null;
    }
    case 1:
      return form.condition ? null : "Please select the overall condition";
    case 2:
      return form.location.state &&
        form.location.city &&
        form.location.pincode.length === 6
        ? null
        : "Please fill in state, city and a valid 6-digit pincode";
    case 3:
      return form.photos.length >= 3 ? null : "Please add at least 3 photos";
    case 4:
      return form.price ? null : "Please set your expected price";
    default:
      return null;
  }
};

interface StepComponentProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const STEP_COMPONENTS: ComponentType<StepComponentProps>[] = [
  StepIdentity,
  StepCondition,
  StepLocation,
  StepMedia,
  StepPricing,
];

const STEP_META: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tips: string[];
}[] = [
  {
    icon: Smartphone,
    title: "What device are you selling?",
    subtitle: "Select the device category and provide basic details.",
    tips: [
      "Select the correct category and brand",
      "Mention the exact model name",
      "Provide accurate color details",
      "Add clear photos in the next steps",
      "Give honest condition for a faster sale",
    ],
  },
  {
    icon: Sparkles,
    title: "Condition & history",
    subtitle: "Tell buyers how the device has been used and what comes with it.",
    tips: [
      "Be honest about scratches or dents",
      "Check battery health in device settings",
      "Mention any past repairs",
      "List every accessory you are including",
    ],
  },
  {
    icon: MapPin,
    title: "Where is the device located?",
    subtitle: "This helps buyers nearby find your listing faster.",
    tips: [
      "Use your exact pincode",
      "Listings near buyers sell faster",
      "Your full address is never shown publicly",
    ],
  },
  {
    icon: Camera,
    title: "Add photos & video",
    subtitle: "Clear photos from every angle help your device sell faster.",
    tips: [
      "Shoot in daylight on a plain background",
      "Show front, back, sides and screen on",
      "Photograph any scratches up close",
      "Add a short video of the device working",
    ],
  },
  {
    icon: IndianRupee,
    title: "Set your price",
    subtitle: "Choose a fair price and describe your device.",
    tips: [
      "Check similar listings before pricing",
      "Enable negotiation to get more offers",
      "Write a short, honest description",
    ],
  },
];

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Zap,
    title: "Quick & Easy Listing",
    text: "List your device in just a few minutes.",
  },
  {
    icon: Tag,
    title: "Get the Best Price",
    text: "Reach thousands of verified buyers.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    text: "Secure payments and safe transactions.",
  },
  {
    icon: Users,
    title: "Trusted Marketplace",
    text: "Join India's most trusted electronics marketplace.",
  },
];

const classes = {
  page: "bg-gray-50/60 pt-6 pb-12",
  wide: "mx-auto max-w-[1340px] px-4",
  container: "mx-auto max-w-2xl px-4 py-10",
  titleBlock: "mb-6 text-center",
  heading: "text-3xl font-extrabold tracking-tight text-gray-900",
  headingSub: "mt-1 text-[15px] text-gray-500",
  title: "mb-6 text-center text-2xl font-bold",
  layout: "mt-7 grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(320px,1fr)]",
  card: "rounded-xl border border-gray-200 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.035)] sm:p-6",
  cardHeader: "mb-6 flex items-center gap-4",
  cardHeaderIconWrap:
    "flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 sm:size-[72px]",
  cardHeaderIcon: "size-8",
  cardTitle: "text-xl font-extrabold tracking-tight text-gray-900",
  cardSubtitle: "mt-1 text-sm text-gray-500",
  footer: "mt-6 flex items-center justify-between",
  footerButton: "h-11 rounded-lg px-5",
  nextButton:
    "h-11 min-w-40 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-7 shadow-sm hover:from-brand-700 hover:to-brand-600",
  nextIcon: "size-4",
  aside: "space-y-4",
  whyCard:
    "rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6",
  tipsCard: "rounded-xl border border-gray-200 bg-white p-6",
  asideHeader: "mb-5 flex items-center gap-4",
  asideHeaderIconWrap:
    "flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600",
  asideHeaderIcon: "size-7",
  asideTitle: "text-lg font-extrabold text-gray-900",
  benefitList: "stagger space-y-4",
  benefit: "flex items-center gap-4",
  benefitIconWrap:
    "flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm",
  benefitIcon: "size-6",
  benefitTitle: "text-sm font-bold text-gray-900",
  benefitText: "mt-0.5 text-xs leading-4 text-gray-500",
  tipList: "stagger space-y-3 text-xs text-gray-600",
  tip: "flex items-center gap-3",
  tipCheck:
    "flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white",
  tipCheckIcon: "size-3",
  gateCard:
    "flex flex-col items-center gap-3 rounded-2xl border p-10 text-center",
  gateCardUnverified: "border-red-200 bg-red-50",
  gateCardPending: "border-amber-200 bg-amber-50",
  gateIconUnverified: "size-12 text-red-500",
  gateIconPending: "size-12 text-amber-500",
  gateBadge:
    "rounded-full bg-red-100 px-3 py-1 text-xs font-bold tracking-wide text-red-700 uppercase",
  gateBadgePending:
    "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-700 uppercase",
  gateTitle: "text-xl font-bold text-gray-900",
  gateText: "max-w-md text-sm text-gray-600",
  gateAction: "mt-2",
};

export interface NotVerifiedSellerProps {
  pending: boolean;
  rejectionReason?: string;
}

// Shown instead of the sell wizard until an admin approves the user's
// seller documents (backend createListing enforces the same rule).
const NotVerifiedSeller = ({
  pending,
  rejectionReason,
}: NotVerifiedSellerProps) => (
  <div className={classes.container}>
    <h1 className={classes.title}>Sell Your Device</h1>
    <div
      className={`${classes.gateCard} ${pending ? classes.gateCardPending : classes.gateCardUnverified}`}
    >
      {pending ? (
        <Clock className={classes.gateIconPending} />
      ) : (
        <ShieldAlert className={classes.gateIconUnverified} />
      )}
      <span className={pending ? classes.gateBadgePending : classes.gateBadge}>
        {pending ? "Verification pending" : "Not a verified seller"}
      </span>
      <h2 className={classes.gateTitle}>
        {pending
          ? "Your documents are under review"
          : "You need to be a verified seller to sell"}
      </h2>
      <p className={classes.gateText}>
        {pending
          ? "An admin is checking your documents. You can list devices as soon as they are approved."
          : rejectionReason
            ? `Your last submission was rejected: ${rejectionReason}. Upload new photos from your profile and resubmit.`
            : "Upload photos of your Aadhaar, PAN and a selfie from your profile. Once an admin verifies them, you can start selling."}
      </p>
      {!pending && (
        <Link to={PATHS.buyer.profile} className={classes.gateAction}>
          <Button icon={ArrowRight}>Get Verified</Button>
        </Link>
      )}
    </div>
  </div>
);

const SellPhone = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SellPhoneForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  if (user.role !== "admin" && !user.sellerProfile?.isVerified) {
    const status = user.sellerProfile?.verificationStatus;
    return (
      <NotVerifiedSeller
        pending={status === "pending"}
        rejectionReason={
          status === "rejected"
            ? user.sellerProfile?.rejectionReason ||
              "documents did not meet requirements"
            : undefined
        }
      />
    );
  }

  // A phone-verified (Firebase OTP) account has no real email to confirm —
  // its address is a synthetic placeholder — so either verified contact
  // method is accepted as proof of identity here.
  const isVerified = user.isEmailVerified || user.isPhoneVerified;

  const next = () => {
    const error = validateStep(step, form);
    if (error) return toast.error(error);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handlePublish = async () => {
    if (!isVerified)
      return toast.error(
        "Please verify your email before publishing a listing",
      );

    const error = validateStep(step, form);
    if (error) return toast.error(error);

    setSubmitting(true);
    try {
      const category = form.category as CreateMobilePayload["category"];
      const usesStorageRam = STORAGE_RAM_CATEGORIES.includes(category);
      const usesBatteryHealth = BATTERY_HEALTH_CATEGORIES.includes(category);
      const usesImei = IMEI_CATEGORIES.includes(category);

      const payload: CreateMobilePayload = {
        category,
        brand: form.brand,
        model: form.model,
        color: form.color || undefined,
        storage: usesStorageRam ? Number(form.storage) : undefined,
        ram: usesStorageRam ? Number(form.ram) : undefined,
        condition: form.condition as MobileCondition,
        batteryHealth: usesBatteryHealth
          ? Number(form.batteryHealth)
          : undefined,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        negotiable: form.negotiable,
        imei: usesImei ? form.imei || undefined : undefined,
        warranty: {
          hasWarranty: form.warranty.hasWarranty,
          expiryDate:
            form.warranty.hasWarranty && form.warranty.expiryDate
              ? form.warranty.expiryDate
              : undefined,
        },
        repairHistory:
          form.hasRepairHistory && form.repairNote
            ? [{ issue: form.repairNote }]
            : [],
        originalBoxAvailable: form.originalBoxAvailable,
        chargerIncluded: form.accessoriesIncluded.includes("Charger"),
        accessoriesIncluded: form.accessoriesIncluded,
        description: form.description || undefined,
        location: {
          state: form.location.state,
          city: form.location.city,
          pincode: form.location.pincode,
          lat: form.location.lat,
          lng: form.location.lng,
        },
      };

      const { data } = await api.post<ApiResponse<Mobile>>("/mobiles", payload);
      const mobileId = data.data._id;

      const imagesForm = new FormData();
      form.photos.forEach((f) => imagesForm.append("images", f));
      await api.post(`/mobiles/${mobileId}/images`, imagesForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (form.video) {
        const videoForm = new FormData();
        videoForm.append("video", form.video);
        await api.post(`/mobiles/${mobileId}/video`, videoForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (form.purchaseBill) {
        const billForm = new FormData();
        billForm.append("bill", form.purchaseBill);
        await api.post(`/mobiles/${mobileId}/purchase-bill`, billForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Listing submitted for approval!");
      navigate(PATHS.buyer.listings);
    } catch (err) {
      const data = isAxiosError<{ message?: string; errors?: string[] }>(err)
        ? err.response?.data
        : undefined;
      toast.error(
        data?.errors?.length
          ? data.errors.join(" ")
          : data?.message || "Could not publish listing",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[step];
  const meta = STEP_META[step];
  const StepIcon = meta.icon;

  return (
    <div className={classes.page}>
      <div className={classes.wide}>
        <div className={classes.titleBlock}>
          <h1 className={classes.heading}>Sell Your Device</h1>
          <p className={classes.headingSub}>
            List your device in just a few simple steps and start earning today.
          </p>
        </div>
        {!isVerified && <EmailVerificationNotice />}
        <WizardProgress steps={STEPS} currentStep={step} />

        <div className={classes.layout}>
          <section className={classes.card}>
            <div className={classes.cardHeader}>
              <span className={classes.cardHeaderIconWrap}>
                <StepIcon className={classes.cardHeaderIcon} />
              </span>
              <div>
                <h2 className={classes.cardTitle}>{meta.title}</h2>
                <p className={classes.cardSubtitle}>{meta.subtitle}</p>
              </div>
            </div>

            {/* Keyed by step so each step slides in */}
            <div key={step} className="animate-fade-up">
              <StepComponent form={form} setForm={setForm} />
            </div>

            <div className={classes.footer}>
              <Button
                variant="secondary"
                onClick={back}
                disabled={step === 0}
                icon={ArrowLeft}
                className={classes.footerButton}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} className={classes.nextButton}>
                  Next <ArrowRight className={classes.nextIcon} />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  loading={submitting}
                  disabled={!isVerified}
                  className={classes.nextButton}
                >
                  Publish Listing
                </Button>
              )}
            </div>
          </section>

          <aside className={classes.aside}>
            <section className={classes.whyCard}>
              <div className={classes.asideHeader}>
                <span className={classes.asideHeaderIconWrap}>
                  <ShieldCheck className={classes.asideHeaderIcon} />
                </span>
                <h2 className={classes.asideTitle}>Why Sell on MAPZHA?</h2>
              </div>
              <div className={classes.benefitList}>
                {BENEFITS.map(({ icon: Icon, title, text }) => (
                  <div key={title} className={classes.benefit}>
                    <span className={classes.benefitIconWrap}>
                      <Icon className={classes.benefitIcon} />
                    </span>
                    <div>
                      <h3 className={classes.benefitTitle}>{title}</h3>
                      <p className={classes.benefitText}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={classes.tipsCard}>
              <div className={classes.asideHeader}>
                <span className={classes.asideHeaderIconWrap}>
                  <Lightbulb className={classes.asideHeaderIcon} />
                </span>
                <h2 className={classes.asideTitle}>Tips for a Better Listing</h2>
              </div>
              <ul key={step} className={classes.tipList}>
                {meta.tips.map((tip) => (
                  <li key={tip} className={classes.tip}>
                    <span className={classes.tipCheck}>
                      <Check className={classes.tipCheckIcon} />
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SellPhone;
