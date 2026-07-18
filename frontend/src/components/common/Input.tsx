import { useState, type InputHTMLAttributes } from "react";
import clsx from "clsx";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

const classes = {
  wrapper: "w-full",
  label: "mb-1.5 block text-sm font-medium text-gray-700",
  inputContainer: "relative",
  iconWrapper:
    "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400",
  inputBase:
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400",
  inputFocus: "focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
  inputError: "border-red-400",
  inputNormal: "border-gray-300",
  inputWithIcon: "pl-10",
  inputWithToggle: "pr-10",
  toggleButton:
    "absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600",
  hint: "mt-1 text-xs text-gray-500",
  error: "mt-1 text-xs text-red-500",
};

const Input = ({
  label,
  error,
  hint,
  className,
  id,
  type,
  icon: Icon,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={classes.wrapper}>
      {label && (
        <label htmlFor={id} className={classes.label}>
          {label}
        </label>
      )}
      <div className={classes.inputContainer}>
        {Icon && (
          <span className={classes.iconWrapper}>
            <Icon size={18} />
          </span>
        )}
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          className={clsx(
            classes.inputBase,
            classes.inputFocus,
            error ? classes.inputError : classes.inputNormal,
            Icon && classes.inputWithIcon,
            isPassword && classes.inputWithToggle,
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className={classes.toggleButton}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && !error && <p className={classes.hint}>{hint}</p>}
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

export default Input;
