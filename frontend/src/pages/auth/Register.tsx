import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { useAppDispatch } from "../../app/hooks";
import { store } from "../../app/store";
import { register } from "../../features/auth/thunks";
import { PATHS, getDashboardPath } from "../../routes/paths";
import type { Role } from "../../types/models";

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<Role, "buyer" | "seller">;
}

const classes = {
  title: "mb-1 text-xl font-bold",
  subtitle: "mb-6 text-sm text-gray-500",
  form: "space-y-4",
  submitButton: "w-full",
  divider: "my-5 flex items-center gap-2 text-xs text-gray-400",
  dividerLine: "h-px flex-1 bg-gray-200 dark:bg-gray-800",
  loginPrompt: "mt-6 text-center text-sm text-gray-500",
  loginLink: "font-medium text-brand-600 hover:underline",
};

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "buyer",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = await dispatch(register(form));
    if (user) {
      toast.success(
        "Account created! Please check your email to verify your address.",
      );
      navigate(getDashboardPath(user.role));
    } else {
      toast.error(store.getState().auth.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className={classes.title}>Create your account</h1>
      <p className={classes.subtitle}>
        Join thousands buying and selling phones safely.
      </p>

      <form onSubmit={handleSubmit} className={classes.form}>
        <Input
          label="Full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
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
        <Select
          label="I want to"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as RegisterForm["role"] })
          }
        >
          <option value="buyer">Buy phones</option>
          <option value="seller">Sell phones</option>
        </Select>
        <Button
          type="submit"
          className={classes.submitButton}
          loading={loading}
        >
          Create account
        </Button>
      </form>

      <div className={classes.divider}>
        <div className={classes.dividerLine} /> OR{" "}
        <div className={classes.dividerLine} />
      </div>

      <GoogleLoginButton
        onSuccess={(user) => navigate(getDashboardPath(user.role))}
      />

      <p className={classes.loginPrompt}>
        Already have an account?{" "}
        <Link to={PATHS.login} className={classes.loginLink}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
