import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { register } from '../../features/auth/authSlice';
import { PATHS } from '../../routes/paths';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(register(form)).unwrap();
      toast.success('Account created! Please check your email to verify your address.');
      navigate(PATHS.home);
    } catch (err) {
      toast.error(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">Join thousands buying and selling phones safely.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="9876543210"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Select label="I want to" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="buyer">Buy phones</option>
          <option value="seller">Sell phones</option>
        </Select>
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-2 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" /> OR <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      </div>

      <GoogleLoginButton onSuccess={() => navigate(PATHS.home)} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to={PATHS.login} className="font-medium text-brand-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
