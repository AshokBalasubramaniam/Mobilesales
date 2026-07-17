import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../app/hooks";
import { store } from "../../app/store";
import { env } from "../../config/env";
import { googleLogin } from "../../features/auth/thunks";
import type { User } from "../../types/models";

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: { credential: string }) => void;
}

interface GoogleButtonConfiguration {
  theme?: string;
  size?: string;
  width?: number;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (
    parent: HTMLElement,
    options: GoogleButtonConfiguration,
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

export interface GoogleLoginButtonProps {
  onSuccess?: (user: User) => void;
}

const classes = {
  disabledButton:
    "w-full cursor-not-allowed rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-400 dark:border-gray-700",
  container: "flex justify-center",
};


const GoogleLoginButton = ({ onSuccess }: GoogleLoginButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const clientId = env.googleClientId;
    if (!clientId || !ref.current) return undefined;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const user = await dispatch(
            googleLogin({ idToken: response.credential }),
          );
          if (user) {
            onSuccess?.(user);
          } else {
            toast.error(store.getState().auth.error || "Google login failed");
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        width: 320,
      });
    };
    document.body.appendChild(script);

    return () => script.remove();
  }, [dispatch, onSuccess]);

  if (!env.googleClientId) {
    return (
      <button
        type="button"
        disabled
        title="Google login is not configured on this server"
        className={classes.disabledButton}
      >
        Continue with Google (not configured)
      </button>
    );
  }

  return <div ref={ref} className={classes.container} />;
};

export default GoogleLoginButton;
