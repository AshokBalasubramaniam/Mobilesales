import { useState } from 'react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { MailWarning } from 'lucide-react';
import api from '../../api/api';
import Button from '../common/Button';

export interface EmailVerificationNoticeProps {
  fullPage?: boolean;
}

/** Shown to signed-in users whose email isn't verified yet, either as a full-page
 * block (route gating) or an inline banner (blocking a specific action). */
const EmailVerificationNotice = ({ fullPage = false }: EmailVerificationNoticeProps) => {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent — check your inbox.');
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not send verification email');
    } finally {
      setSending(false);
    }
  };

  const content = (
    <div className="flex flex-col items-center gap-3 text-center">
      <MailWarning className="size-10 text-amber-500" />
      <h2 className="text-lg font-semibold">Verify your email to continue</h2>
      <p className="max-w-sm text-sm text-gray-500">
        We sent a verification email when you signed up. Please verify your address to unlock this feature.
      </p>
      <Button size="sm" onClick={handleResend} loading={sending}>
        Resend verification email
      </Button>
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[60vh] items-center justify-center p-6">{content}</div>;
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
      {content}
    </div>
  );
};

export default EmailVerificationNotice;
