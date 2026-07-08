import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { PATHS } from '../../routes/paths';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-xl font-bold">Check your email</h1>
        <p className="text-sm text-gray-500">If that email is registered, we've sent a password reset link to {email}.</p>
        <Link to={PATHS.login} className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Forgot password?</h1>
      <p className="mb-6 text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
      <Link to={PATHS.login} className="mt-4 block text-center text-sm text-gray-500 hover:underline">
        Back to login
      </Link>
    </div>
  );
};

export default ForgotPassword;
