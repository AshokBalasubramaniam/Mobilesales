import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { CheckCircle2, Clock, FileUp, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '../../api/api';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'Something went wrong' : 'Something went wrong';

interface FileFieldProps {
  label: string;
  file: File | undefined;
  onChange: (file: File | undefined) => void;
  required?: boolean;
}

const FileField = ({ label, file, onChange, required }: FileFieldProps) => (
  <div>
    <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </p>
    <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-700">
      <FileUp className="size-4" />
      {file ? file.name : 'Choose file'}
      <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => onChange(e.target.files?.[0])} />
    </label>
  </div>
);

interface VerificationFiles {
  aadhaar: File | undefined;
  pan: File | undefined;
  selfie: File | undefined;
  purchaseBill: File | undefined;
  [key: string]: File | undefined;
}

const Verification = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<VerificationFiles>({ aadhaar: undefined, pan: undefined, selfie: undefined, purchaseBill: undefined });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const status = user.sellerProfile?.verificationStatus || 'not_submitted';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.aadhaar || !files.pan || !files.selfie) {
      toast.error('Aadhaar, PAN, and selfie are required');
      return;
    }
    setSubmitting(true);
    try {
      const verificationForm = new FormData();
      Object.entries(files).forEach(([key, file]) => file && verificationForm.append(key, file));
      await api.post('/users/seller/verification', verificationForm, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documents submitted! Our team will review them shortly.');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'approved') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-10 text-center dark:border-green-900 dark:bg-green-900/20">
        <ShieldCheck className="size-10 text-green-600" />
        <h2 className="text-lg font-bold">You're a verified seller!</h2>
        <p className="text-sm text-gray-500">Buyers can see your verified badge on all your listings.</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-10 text-center dark:border-amber-900 dark:bg-amber-900/20">
        <Clock className="size-10 text-amber-600" />
        <h2 className="text-lg font-bold">Verification in progress</h2>
        <p className="text-sm text-gray-500">We're reviewing your documents. This usually takes 1-2 business days.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Seller Verification</h2>
      <p className="mb-6 text-sm text-gray-500">Upload your documents to get a verified badge and build buyer trust.</p>

      {status === 'rejected' && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          <ShieldAlert className="size-4 shrink-0" />
          <span>Your last submission was rejected: {user.sellerProfile?.rejectionReason || 'documents did not meet requirements'}. Please resubmit.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <FileField label="Aadhaar Card" required file={files.aadhaar} onChange={(f) => setFiles({ ...files, aadhaar: f })} />
        <FileField label="PAN Card" required file={files.pan} onChange={(f) => setFiles({ ...files, pan: f })} />
        <FileField label="Selfie" required file={files.selfie} onChange={(f) => setFiles({ ...files, selfie: f })} />
        <FileField label="Mobile Purchase Bill (optional)" file={files.purchaseBill} onChange={(f) => setFiles({ ...files, purchaseBill: f })} />
        <Button type="submit" className="w-full" loading={submitting} icon={CheckCircle2}>
          Submit for Verification
        </Button>
      </form>
    </div>
  );
};

export default Verification;
