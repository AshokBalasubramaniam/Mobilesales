import {
  useState,
  type ComponentType,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const classes = {
  container: "mx-auto max-w-2xl px-4 py-10",
  title: "mb-6 text-center text-2xl font-bold",
  card: "rounded-2xl border border-gray-200 p-6",
  footer: "mt-6 flex justify-between",
  nextIcon: "size-4",
};

const SellPhone = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SellPhoneForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const next = () => {
    const error = validateStep(step, form);
    if (error) return toast.error(error);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handlePublish = async () => {
    if (!user.isEmailVerified)
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
      navigate(PATHS.seller.listings);
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not publish listing",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Sell Your Device</h1>
      {!user.isEmailVerified && <EmailVerificationNotice />}
      <WizardProgress steps={STEPS} currentStep={step} />

      <div className={classes.card}>
        <StepComponent form={form} setForm={setForm} />
      </div>

      <div className={classes.footer}>
        <Button
          variant="secondary"
          onClick={back}
          disabled={step === 0}
          icon={ChevronLeft}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Next <ChevronRight className={classes.nextIcon} />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            loading={submitting}
            disabled={!user.isEmailVerified}
          >
            Publish Listing
          </Button>
        )}
      </div>
    </div>
  );
};

export default SellPhone;
