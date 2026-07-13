import { useState, type ComponentType, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WizardProgress from '../../components/sell/WizardProgress';
import StepIdentity, { type SellPhoneForm } from '../../components/sell/StepIdentity';
import StepCondition from '../../components/sell/StepCondition';
import StepLocation from '../../components/sell/StepLocation';
import StepMedia from '../../components/sell/StepMedia';
import StepPricing from '../../components/sell/StepPricing';
import Button from '../../components/common/Button';
import EmailVerificationNotice from '../../components/auth/EmailVerificationNotice';
import { useAuth } from '../../hooks/useAuth';
import { mobilesApi, type CreateMobilePayload } from '../../api/mobiles.api';
import { PATHS } from '../../routes/paths';
import type { MobileCondition } from '../../types/models';

const STEPS = ['Phone', 'Condition', 'Location', 'Photos', 'Price'];

const INITIAL_FORM: SellPhoneForm = {
  brand: '',
  model: '',
  storage: '',
  ram: '',
  color: '',
  condition: '',
  batteryHealth: 80,
  imei: '',
  warranty: { hasWarranty: false, expiryDate: '' },
  hasRepairHistory: false,
  repairNote: '',
  originalBoxAvailable: false,
  accessoriesIncluded: [],
  location: { state: '', city: '', pincode: '', lat: undefined, lng: undefined },
  photos: [],
  video: null,
  purchaseBill: null,
  mrp: '',
  price: '',
  negotiable: true,
  description: '',
};

const validateStep = (step: number, form: SellPhoneForm): string | null => {
  switch (step) {
    case 0:
      return form.brand && form.model && form.storage && form.ram ? null : 'Please fill in brand, model, storage and RAM';
    case 1:
      return form.condition ? null : 'Please select the overall condition';
    case 2:
      return form.location.state && form.location.city && form.location.pincode.length === 6
        ? null
        : 'Please fill in state, city and a valid 6-digit pincode';
    case 3:
      return form.photos.length >= 3 ? null : 'Please add at least 3 photos';
    case 4:
      return form.price ? null : 'Please set your expected price';
    default:
      return null;
  }
};

interface StepComponentProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const STEP_COMPONENTS: ComponentType<StepComponentProps>[] = [StepIdentity, StepCondition, StepLocation, StepMedia, StepPricing];

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
    if (!user.isEmailVerified) return toast.error('Please verify your email before publishing a listing');

    const error = validateStep(step, form);
    if (error) return toast.error(error);

    setSubmitting(true);
    try {
      const payload: CreateMobilePayload = {
        brand: form.brand,
        model: form.model,
        color: form.color || undefined,
        storage: Number(form.storage),
        ram: Number(form.ram),
        condition: form.condition as MobileCondition,
        batteryHealth: Number(form.batteryHealth),
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        negotiable: form.negotiable,
        imei: form.imei || undefined,
        warranty: {
          hasWarranty: form.warranty.hasWarranty,
          expiryDate: form.warranty.hasWarranty && form.warranty.expiryDate ? form.warranty.expiryDate : undefined,
        },
        repairHistory: form.hasRepairHistory && form.repairNote ? [{ issue: form.repairNote }] : [],
        originalBoxAvailable: form.originalBoxAvailable,
        chargerIncluded: form.accessoriesIncluded.includes('Charger'),
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

      const { data } = await mobilesApi.create(payload);
      const mobileId = data.data._id;

      await mobilesApi.uploadImages(mobileId, form.photos);
      if (form.video) await mobilesApi.uploadVideo(mobileId, form.video);
      if (form.purchaseBill) await mobilesApi.uploadPurchaseBill(mobileId, form.purchaseBill);

      toast.success('Listing submitted for approval!');
      navigate(PATHS.seller.listings);
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">Sell Your Phone</h1>
      {!user.isEmailVerified && <EmailVerificationNotice />}
      <WizardProgress steps={STEPS} currentStep={step} />

      <div className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
        <StepComponent form={form} setForm={setForm} />
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={back} disabled={step === 0} icon={ChevronLeft}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Next <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handlePublish} loading={submitting} disabled={!user.isEmailVerified}>
            Publish Listing
          </Button>
        )}
      </div>
    </div>
  );
};

export default SellPhone;
