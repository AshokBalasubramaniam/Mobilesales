import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import api from "../../api/api";
import { PATHS } from "../../routes/paths";

const classes = {
  title: "mb-1 text-xl font-bold",
  subtitle: "mb-6 text-sm text-gray-500",
  form: "space-y-4",
  submitButton: "w-full",
  backLink: "mt-4 block text-center text-sm text-gray-500 hover:underline",
  modalDescription: "text-sm text-gray-500",
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault();
    setSendingCode(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success(
        "If that email is registered, we've sent a reset code to it.",
      );
      setOtpModalOpen(true);
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Something went wrong",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetting(true);
    try {
      await api.post("/auth/reset-password", { email, code, password });
      toast.success("Password reset! Please login.");
      navigate(PATHS.login);
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Invalid or expired code",
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <h1 className={classes.title}>Forgot password?</h1>
      <p className={classes.subtitle}>
        Enter your email and we'll send you a 6-digit reset code.
      </p>
      <form onSubmit={handleRequestCode} className={classes.form}>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="submit"
          className={classes.submitButton}
          loading={sendingCode}
        >
          Send reset code
        </Button>
      </form>
      <Link to={PATHS.login} className={classes.backLink}>
        Back to login
      </Link>

      <Modal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title="Enter reset code"
      >
        <form onSubmit={handleReset} className={classes.form}>
          <p className={classes.modalDescription}>
            Enter the 6-digit code sent to {email} and choose a new password.
          </p>
          <Input
            label="Reset code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            hint="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            className={classes.submitButton}
            loading={resetting}
          >
            Reset password
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
