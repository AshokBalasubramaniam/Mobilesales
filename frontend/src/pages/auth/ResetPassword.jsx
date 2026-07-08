import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { PATHS } from '../../routes/paths';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Missing or invalid reset link');
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset! Please login.');
      navigate(PATHS.login);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Set a new password</h1>
      <p className="mb-6 text-sm text-gray-500">Choose a new password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" loading={loading} disabled={!token}>
          Reset password
        </Button>
      </form>
      <Link to={PATHS.login} className="mt-4 block text-center text-sm text-gray-500 hover:underline">
        Back to login
      </Link>
    </div>
  );
};

export default ResetPassword;
