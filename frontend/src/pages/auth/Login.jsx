import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Lock, Smartphone } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { login } from '../../features/auth/authSlice';
import { PATHS, getDashboardPath } from '../../routes/paths';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (user) => navigate(location.state?.from?.pathname || getDashboardPath(user.role), { replace: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await dispatch(login(form)).unwrap();
      redirectAfterLogin(user);
    } catch (err) {
      toast.error(err || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
        <span className="absolute -top-1 -left-5 size-2 rounded-full bg-accent-500" />
        <span className="absolute top-1 -right-6 size-1.5 rounded-full bg-blue-400" />
        <span className="absolute -bottom-1 -left-6 size-1.5 rounded-full bg-fuchsia-400" />
        <Smartphone className="size-7 text-brand-600" />
      </div>
      <h1 className="mb-1 text-center text-xl font-bold">Welcome back!</h1>
      <p className="mb-6 text-center text-sm text-gray-500">Login to continue buying and selling phones.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="Enter your email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex justify-end">
          <Link to={PATHS.forgotPassword} className="text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Login
        </Button>
      </form>

      <div className="my-5 flex items-center gap-2 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" /> OR <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="space-y-2.5">
        <GoogleLoginButton onSuccess={redirectAfterLogin} />
        <Link to={PATHS.otpLogin}>
          <Button variant="secondary" icon={Smartphone} className="w-full">
            Login with OTP
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{' '}
        <Link to={PATHS.register} className="font-medium text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;
