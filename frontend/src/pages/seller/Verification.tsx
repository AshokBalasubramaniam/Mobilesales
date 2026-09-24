import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import clsx from "clsx";
import {
  CheckCircle2,
  Clock,
  FileText,
  ImagePlus,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "../../api/api";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { setUser } from "../../features/auth/slice";
import type { ApiResponse } from "../../types/api";
import type { SellerProfile } from "../../types/models";

export interface VerificationProps {
  // Rendered inside another card (Profile page) — drop the page heading and
  // outer padding.
  embedded?: boolean;
}

const classes = {
  fieldLabel: "mb-1.5 text-sm font-medium text-gray-700",
  fieldRequired: "text-red-500",
  dropzone:
    "flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50",
  dropzoneIcon: "size-6 text-gray-400",
  previewWrap:
    "relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-brand-300 bg-gray-50",
  previewImage: "size-full object-cover",
  previewPdf:
    "flex size-full flex-col items-center justify-center gap-1 px-2 text-center text-xs text-gray-600",
  previewPdfIcon: "size-7 text-brand-600",
  removeButton:
    "absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80",
  removeIcon: "size-3.5",
  statusBase: "flex flex-col items-center gap-3 rounded-xl border text-center",
  statusPadding: "p-10",
  statusPaddingEmbedded: "p-5",
  approvedContainer: "border-green-200 bg-green-50",
  approvedIcon: "size-10 text-green-600",
  pendingContainer: "border-amber-200 bg-amber-50",
  pendingIcon: "size-10 text-amber-600",
  statusTitle: "text-lg font-bold",
  statusText: "text-sm text-gray-500",
  pageTitle: "mb-1 text-lg font-semibold",
  pageDescription: "mb-6 text-sm text-gray-500",
  rejectedBanner:
    "mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700",
  rejectedIcon: "size-4 shrink-0",
  form: "space-y-4",
  formCard: "rounded-xl border border-gray-200 p-6",
  fileGrid: "grid grid-cols-2 gap-4 md:grid-cols-4",
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

const FileField = ({ label, file, onChange, required }: FileFieldProps) => {
  const previewUrl = useMemo(
    () =>
      file && file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    [file],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  return (
    <div>
      <p className={classes.fieldLabel}>
        {label} {required && <span className={classes.fieldRequired}>*</span>}
      </p>
      {file ? (
        <div className={classes.previewWrap}>
          {previewUrl ? (
            <img src={previewUrl} alt={label} className={classes.previewImage} />
          ) : (
            <div className={classes.previewPdf}>
              <FileText className={classes.previewPdfIcon} />
              <span className="line-clamp-2 break-all">{file.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={classes.removeButton}
            aria-label={`Remove ${label}`}
          >
            <X className={classes.removeIcon} />
          </button>
        </div>
      ) : (
        <label className={classes.dropzone}>
          <ImagePlus className={classes.dropzoneIcon} />
          Add photo
          <input
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(e) => onChange(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
};

interface VerificationFiles {
  aadhaar: File | undefined;
  pan: File | undefined;
  selfie: File | undefined;
  purchaseBill: File | undefined;
  [key: string]: File | undefined;
}

const Verification = ({ embedded = false }: VerificationProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<VerificationFiles>({
    aadhaar: undefined,
    pan: undefined,
    selfie: undefined,
    purchaseBill: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const status = user.sellerProfile?.verificationStatus || "not_submitted";
  const statusPadding = embedded
    ? classes.statusPaddingEmbedded
    : classes.statusPadding;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.aadhaar || !files.pan || !files.selfie) {
      toast.error("Aadhaar, PAN, and selfie photos are required");
      return;
    }
    setSubmitting(true);
    try {
      const verificationForm = new FormData();
      Object.entries(files).forEach(
        ([key, file]) => file && verificationForm.append(key, file),
      );
      const { data } = await api.post<ApiResponse<SellerProfile>>(
        "/users/seller/verification",
        verificationForm,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      // Reflect the new "pending" status right away (the backend also
      // switches the account to the seller role on submit).
      dispatch(setUser({ ...user, role: "seller", sellerProfile: data.data }));
      toast.success("Documents submitted! Our team will review them shortly.");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "approved") {
    return (
      <div
        className={clsx(
          classes.statusBase,
          classes.approvedContainer,
          statusPadding,
        )}
      >
        <ShieldCheck className={classes.approvedIcon} />
        <h2 className={classes.statusTitle}>You&apos;re a verified seller!</h2>
        <p className={classes.statusText}>
          You can now list devices for sale, and buyers see your verified
          badge on all your listings.
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        className={clsx(
          classes.statusBase,
          classes.pendingContainer,
          statusPadding,
        )}
      >
        <Clock className={classes.pendingIcon} />
        <h2 className={classes.statusTitle}>Verification in progress</h2>
        <p className={classes.statusText}>
          An admin is reviewing your documents. You can start selling once
          they are approved — this usually takes 1-2 business days.
        </p>
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <>
          <h2 className={classes.pageTitle}>Seller Verification</h2>
          <p className={classes.pageDescription}>
            Upload photos of your documents. Once an admin verifies them you
            can start selling.
          </p>
        </>
      )}

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

      <form
        onSubmit={handleSubmit}
        className={clsx(classes.form, !embedded && classes.formCard)}
      >
        <div className={classes.fileGrid}>
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
            label="Purchase Bill (optional)"
            file={files.purchaseBill}
            onChange={(f) => setFiles({ ...files, purchaseBill: f })}
          />
        </div>
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
