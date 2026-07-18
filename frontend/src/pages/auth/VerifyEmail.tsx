import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import api from "../../api/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { bootstrapAuth } from "../../features/auth/thunks";
import { PATHS } from "../../routes/paths";

const classes = {
  container: "text-center",
  successIcon: "mx-auto mb-3 size-12 text-green-500",
  title: "text-xl font-bold",
  description: "mt-1 mb-6 text-sm text-gray-500",
  form: "space-y-4 text-left",
  submitButton: "w-full",
  resendRow: "mt-4 text-center text-sm text-gray-500",
  resendLink: "font-medium text-brand-600 hover:underline",
  homeLink:
    "mt-6 inline-block text-sm font-medium text-brand-600 hover:underline",
};

const VerifyEmail = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(user?.email ?? "");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await api.post("/auth/verify-email", { email, code });
      toast.success("Email verified successfully!");
      setVerified(true);
      dispatch(bootstrapAuth());
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Invalid or expired code",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification");
      toast.success("Verification code sent — check your inbox.");
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not send verification code",
      );
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className={classes.container}>
        <CheckCircle2 className={classes.successIcon} />
        <h1 className={classes.title}>Email verified!</h1>
        <p className={classes.description}>
          Your email has been verified successfully.
        </p>
        <Link to={PATHS.home} className={classes.homeLink}>
          Go to homepage
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={classes.title}>Verify your email</h1>
      <p className={classes.description}>
        Enter the 6-digit code we sent to your email address.
      </p>
      <form onSubmit={handleVerify} className={classes.form}>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Verification code"
          required
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button
          type="submit"
          className={classes.submitButton}
          loading={verifying}
        >
          Verify email
        </Button>
      </form>
      <p className={classes.resendRow}>
        Didn't get a code?{" "}
        <button
          type="button"
          className={classes.resendLink}
          onClick={handleResend}
          disabled={resending}
        >
          Resend code
        </button>
      </p>
      <Link to={PATHS.home} className={classes.homeLink}>
        Go to homepage
      </Link>
    </div>
  );
};

export default VerifyEmail;
