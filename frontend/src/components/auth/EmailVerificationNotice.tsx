import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { MailWarning } from "lucide-react";
import api from "../../api/api";
import Button from "../common/Button";
import { PATHS } from "../../routes/paths";

export interface EmailVerificationNoticeProps {
  fullPage?: boolean;
}

const classes = {
  content: "flex flex-col items-center gap-3 text-center",
  icon: "size-10 text-amber-500",
  title: "text-lg font-semibold",
  description: "max-w-sm text-sm text-gray-500",
  fullPageWrapper: "flex min-h-[60vh] items-center justify-center p-6",
  inlineWrapper: "mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4",
};

const EmailVerificationNotice = ({
  fullPage = false,
}: EmailVerificationNoticeProps) => {
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post("/auth/resend-verification");
      toast.success("Verification code sent — check your inbox.");
      navigate(PATHS.verifyEmail);
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not send verification email",
      );
    } finally {
      setSending(false);
    }
  };

  const content = (
    <div className={classes.content}>
      <MailWarning className={classes.icon} />
      <h2 className={classes.title}>Verify your email to continue</h2>
      <p className={classes.description}>
        Please verify your email address with a one-time code to unlock this
        feature.
      </p>
      <Button size="sm" onClick={handleResend} loading={sending}>
        Send verification code
      </Button>
    </div>
  );

  if (fullPage) {
    return <div className={classes.fullPageWrapper}>{content}</div>;
  }

  return <div className={classes.inlineWrapper}>{content}</div>;
};

export default EmailVerificationNotice;
