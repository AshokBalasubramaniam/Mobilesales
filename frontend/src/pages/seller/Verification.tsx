import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  CheckCircle2,
  Clock,
  FileUp,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/api";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const classes = {
  fieldLabel: "mb-1.5 text-sm font-medium text-gray-700",
  fieldRequired: "text-red-500",
  dropzone:
    "flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500",
  dropzoneIcon: "size-4",
  approvedContainer:
    "flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-10 text-center",
  approvedIcon: "size-10 text-green-600",
  approvedTitle: "text-lg font-bold",
  approvedText: "text-sm text-gray-500",
  pendingContainer:
    "flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-10 text-center",
  pendingIcon: "size-10 text-amber-600",
  pendingTitle: "text-lg font-bold",
  pendingText: "text-sm text-gray-500",
  pageTitle: "mb-1 text-lg font-semibold",
  pageDescription: "mb-6 text-sm text-gray-500",
  rejectedBanner:
    "mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700",
  rejectedIcon: "size-4 shrink-0",
  form: "space-y-4 rounded-xl border border-gray-200 p-6",
  submitButton: "w-full",
};

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? "Something went wrong")
    : "Something went wrong";

interface FileFieldProps {
  label: string;
  file: File | undefined;
  onChange: (file: File | undefined) => void;
  required?: boolean;
}

const FileField = ({ label, file, onChange, required }: FileFieldProps) => (
  <div>
    <p className={classes.fieldLabel}>
      {label} {required && <span className={classes.fieldRequired}>*</span>}
    </p>
    <label className={classes.dropzone}>
      <FileUp className={classes.dropzoneIcon} />
      {file ? file.name : "Choose file"}
      <input
        type="file"
        accept="image/*,application/pdf"
        hidden
        onChange={(e) => onChange(e.target.files?.[0])}
      />
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
  const [files, setFiles] = useState<VerificationFiles>({
    aadhaar: undefined,
    pan: undefined,
    selfie: undefined,
    purchaseBill: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const status = user.sellerProfile?.verificationStatus || "not_submitted";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.aadhaar || !files.pan || !files.selfie) {
      toast.error("Aadhaar, PAN, and selfie are required");
      return;
    }
    setSubmitting(true);
    try {
      const verificationForm = new FormData();
      Object.entries(files).forEach(
        ([key, file]) => file && verificationForm.append(key, file),
      );
      await api.post("/users/seller/verification", verificationForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Documents submitted! Our team will review them shortly.");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "approved") {
    return (
      <div className={classes.approvedContainer}>
        <ShieldCheck className={classes.approvedIcon} />
        <h2 className={classes.approvedTitle}>You're a verified seller!</h2>
        <p className={classes.approvedText}>
          Buyers can see your verified badge on all your listings.
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className={classes.pendingContainer}>
        <Clock className={classes.pendingIcon} />
        <h2 className={classes.pendingTitle}>Verification in progress</h2>
        <p className={classes.pendingText}>
          We're reviewing your documents. This usually takes 1-2 business days.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={classes.pageTitle}>Seller Verification</h2>
      <p className={classes.pageDescription}>
        Upload your documents to get a verified badge and build buyer trust.
      </p>

      {status === "rejected" && (
        <div className={classes.rejectedBanner}>
          <ShieldAlert className={classes.rejectedIcon} />
          <span>
            Your last submission was rejected:{" "}
            {user.sellerProfile?.rejectionReason ||
              "documents did not meet requirements"}
            . Please resubmit.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={classes.form}>
        <FileField
          label="Aadhaar Card"
          required
          file={files.aadhaar}
          onChange={(f) => setFiles({ ...files, aadhaar: f })}
        />
        <FileField
          label="PAN Card"
          required
          file={files.pan}
          onChange={(f) => setFiles({ ...files, pan: f })}
        />
        <FileField
          label="Selfie"
          required
          file={files.selfie}
          onChange={(f) => setFiles({ ...files, selfie: f })}
        />
        <FileField
          label="Mobile Purchase Bill (optional)"
          file={files.purchaseBill}
          onChange={(f) => setFiles({ ...files, purchaseBill: f })}
        />
        <Button
          type="submit"
          className={classes.submitButton}
          loading={submitting}
          icon={CheckCircle2}
        >
          Submit for Verification
        </Button>
      </form>
    </div>
  );
};

export default Verification;
