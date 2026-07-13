import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { authApi } from '../../api/auth.api';
import { PATHS } from '../../routes/paths';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault();
    setSendingCode(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("If that email is registered, we've sent a reset code to it.");
      setOtpModalOpen(true);
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Something went wrong');
    } finally {
      setSendingCode(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetting(true);
    try {
      await authApi.resetPassword({ email, code, password });
      toast.success('Password reset! Please login.');
      navigate(PATHS.login);
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Invalid or expired code');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Forgot password?</h1>
      <p className="mb-6 text-sm text-gray-500">Enter your email and we'll send you a 6-digit reset code.</p>
      <form onSubmit={handleRequestCode} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" className="w-full" loading={sendingCode}>
          Send reset code
        </Button>
      </form>
      <Link to={PATHS.login} className="mt-4 block text-center text-sm text-gray-500 hover:underline">
        Back to login
      </Link>

      <Modal open={otpModalOpen} onClose={() => setOtpModalOpen(false)} title="Enter reset code">
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-gray-500">Enter the 6-digit code sent to {email} and choose a new password.</p>
          <Input label="Reset code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            hint="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" loading={resetting}>
            Reset password
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
