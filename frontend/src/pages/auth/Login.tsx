import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Lock, User as UserIcon } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { useAppDispatch } from "../../app/hooks";
import { store } from "../../app/store";
import {
  requestOtp,
  verifyOtp,
  completeOtpRegistration,
} from "../../features/auth/thunks";
import { PATHS, getDashboardPath } from "../../routes/paths";
import type { User } from "../../types/models";

type LoginStep = "phone" | "otp" | "register";

const classes = {
  title: "mb-1 text-center text-2xl font-bold text-brand-900",
  subtitle: "mb-6 text-center text-sm text-gray-500",
  form: "space-y-4",
  submitButton: "w-full",
  changePhoneButton:
    "w-full text-center text-xs text-gray-500 hover:underline",
  divider: "my-5 flex items-center gap-2 text-xs text-gray-400",
  dividerLine: "h-px flex-1 bg-gray-200",
  altActions: "space-y-2.5",
  footer: "mt-6 text-center text-sm text-gray-500",
  registerLink: "font-medium text-brand-600 hover:underline",
};

const Login = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = (location.state as { from?: { pathname?: string } } | null)
    ?.from?.pathname;
  const isSellerSignup = fromPath === PATHS.sell;

  const redirectAfterLogin = (user: User) =>
    navigate(fromPath || getDashboardPath(user.role), { replace: true });

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sentPhone = await dispatch(requestOtp(phone));
    if (sentPhone) {
      toast.success("OTP sent to your phone");
      setStep("otp");
    } else {
      toast.error(store.getState().auth.error || "Could not send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(verifyOtp({ phone, code }));
    if (result?.status === "logged_in") {
      redirectAfterLogin(result.user);
    } else if (result?.status === "needs_registration") {
      setFirebaseIdToken(result.idToken);
      setStep("register");
    } else {
      toast.error(store.getState().auth.error || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleCompleteRegistration = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = await dispatch(
      completeOtpRegistration({
        idToken: firebaseIdToken,
        name,
        password,
        role: isSellerSignup ? "seller" : "buyer",
      }),
    );
    if (user) {
      redirectAfterLogin(user);
    } else {
      toast.error(store.getState().auth.error || "Could not create account");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className={classes.title}>Welcome back!</h1>
      <p className={classes.subtitle}>
        {step === "phone" && "Login to continue buying and selling devices."}
        {step === "otp" && `Enter the 6-digit code sent to ${phone}`}
        {step === "register" &&
          (isSellerSignup
            ? "New number — create your seller account to continue."
            : "New number — create your account to continue.")}
      </p>

      {step === "phone" && (
        <form onSubmit={handleRequestOtp} className={classes.form}>
          <Input
            label="Mobile number"
            type="tel"
            required
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            type="submit"
            className={classes.submitButton}
            icon={ArrowRight}
            loading={loading}
          >
            Send OTP
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className={classes.form}>
          <Input
            label="OTP Code"
            icon={Lock}
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            type="submit"
            className={classes.submitButton}
            icon={ArrowRight}
            loading={loading}
          >
            Verify & Login
          </Button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className={classes.changePhoneButton}
          >
            Change phone number
          </button>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={handleCompleteRegistration} className={classes.form}>
          <Input
            label="Full name"
            icon={UserIcon}
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            required
            minLength={8}
            hint="At least 8 characters, with uppercase, lowercase, a number & a symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            className={classes.submitButton}
            icon={ArrowRight}
            loading={loading}
          >
            Create account
          </Button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className={classes.changePhoneButton}
          >
            Change phone number
          </button>
        </form>
      )}

      <div className={classes.divider}>
        <div className={classes.dividerLine} /> OR{" "}
        <div className={classes.dividerLine} />
      </div>

      <div className={classes.altActions}>
        <GoogleLoginButton onSuccess={redirectAfterLogin} />
        <Link to={PATHS.passwordLogin} state={location.state}>
          <Button variant="secondary" className={classes.submitButton}>
            Login with email & password
          </Button>
        </Link>
      </div>

      <p className={classes.footer}>
        New here?{" "}
        <Link
          to={PATHS.register}
          state={location.state}
          className={classes.registerLink}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;
