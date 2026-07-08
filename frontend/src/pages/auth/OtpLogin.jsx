import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { requestOtp, verifyOtp } from '../../features/auth/authSlice';

const OtpLogin = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(requestOtp(phone)).unwrap();
      toast.success('OTP sent to your phone');
      setStep('otp');
    } catch (err) {
      toast.error(err || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(verifyOtp({ phone, code })).unwrap();
      navigate('/');
    } catch (err) {
      toast.error(err || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
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
