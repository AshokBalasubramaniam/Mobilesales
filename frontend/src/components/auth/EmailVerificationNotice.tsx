import { MailWarning } from "lucide-react";
import EmailCodeVerifier from "./EmailCodeVerifier";

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
  const content = (
    <div className={classes.content}>
      <MailWarning className={classes.icon} />
      <h2 className={classes.title}>Verify your email to continue</h2>
      <p className={classes.description}>
        Please verify your email address with a one-time code to unlock this
        feature.
      </p>
      <EmailCodeVerifier />
    </div>
  );

  if (fullPage) {
    return <div className={classes.fullPageWrapper}>{content}</div>;
  }

  return <div className={classes.inlineWrapper}>{content}</div>;
};

export default EmailVerificationNotice;
