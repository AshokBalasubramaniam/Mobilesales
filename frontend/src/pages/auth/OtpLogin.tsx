import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAppDispatch } from '../../app/hooks';
import { store } from '../../app/store';
import { requestOtp, verifyOtp } from '../../features/auth/thunks';
import { getDashboardPath } from '../../routes/paths';

type OtpStep = 'phone' | 'otp';

const OtpLogin = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<OtpStep>('phone');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sentPhone = await dispatch(requestOtp(phone));
    if (sentPhone) {
      toast.success('OTP sent to your phone');
      setStep('otp');
    } else {
      toast.error(store.getState().auth.error || 'Could not send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = await dispatch(verifyOtp({ phone, code }));
    if (user) {
      navigate(location.state?.from?.pathname || getDashboardPath(user.role));
    } else {
      toast.error(store.getState().auth.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Login with OTP</h1>
      <p className="mb-6 text-sm text-gray-500">
        {step === 'phone' ? "We'll text you a one-time code." : `Enter the 6-digit code sent to ${phone}`}
      </p>

      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input label="Mobile number" type="tel" required placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" className="w-full" loading={loading}>
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input label="OTP Code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit" className="w-full" loading={loading}>
            Verify & Login
          </Button>
          <button type="button" onClick={() => setStep('phone')} className="w-full text-center text-xs text-gray-500 hover:underline">
            Change phone number
          </button>
        </form>
      )}
    </div>
  );
};

export default OtpLogin;
