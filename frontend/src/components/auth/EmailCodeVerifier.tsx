import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import clsx from "clsx";
import api from "../../api/api";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../app/hooks";
import { setUser } from "../../features/auth/slice";

export interface EmailCodeVerifierProps {
  // "button": a Send button (notices); "link": an inline text link (Profile)
  trigger?: "button" | "link";
  className?: string;
}

const classes = {
  linkTrigger:
    "text-xs font-medium text-brand-600 underline hover:text-brand-700 disabled:opacity-50",
  form: "flex w-full max-w-sm flex-col gap-2",
  hint: "text-xs text-gray-500",
  row: "flex gap-2",
  codeInput:
    "min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
  resend:
    "self-center text-xs font-medium text-brand-600 hover:underline disabled:opacity-50",
};

const errorMessage = (err: unknown, fallback: string) =>
  (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) ||
  fallback;

// Sends the email verification code and lets the user enter it in place —
// replaces the old standalone /verify-email page.
const EmailCodeVerifier = ({
  trigger = "button",
  className,
}: EmailCodeVerifierProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!user) return null;

  const sendCode = async () => {
    setSending(true);
    try {
      await api.post("/auth/resend-verification");
      toast.success("Verification code sent — check your inbox.");
      setCodeSent(true);
    } catch (err) {
      toast.error(errorMessage(err, "Could not send verification email"));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await api.post("/auth/verify-email", { email: user.email, code });
      toast.success("Email verified successfully!");
      dispatch(setUser({ ...user, isEmailVerified: true }));
    } catch (err) {
      toast.error(errorMessage(err, "Invalid or expired code"));
    } finally {
      setVerifying(false);
    }
  };

  if (!codeSent) {
    return trigger === "link" ? (
      <button
        type="button"
        onClick={sendCode}
        disabled={sending}
        className={clsx(classes.linkTrigger, className)}
      >
        {sending ? "Sending…" : "Verify email"}
      </button>
    ) : (
      <Button size="sm" onClick={sendCode} loading={sending} className={className}>
        Send verification code
      </Button>
    );
  }

  return (
    <form onSubmit={handleVerify} className={clsx(classes.form, className)}>
      <p className={classes.hint}>Enter the 6-digit code sent to {user.email}</p>
      <div className={classes.row}>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          minLength={6}
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={classes.codeInput}
        />
        <Button type="submit" size="sm" loading={verifying}>
          Verify
        </Button>
      </div>
      <button
        type="button"
        onClick={sendCode}
        disabled={sending}
        className={classes.resend}
      >
        {sending ? "Sending…" : "Resend code"}
      </button>
    </form>
  );
};

export default EmailCodeVerifier;
