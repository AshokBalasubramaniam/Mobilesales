import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { openLoginModal, type LoginModalIntent } from "../features/ui/slice";
import { PATHS } from "./paths";

export interface LoginModalRedirectProps {
  mode: NonNullable<LoginModalIntent["mode"]>;
}

// Email login and signup live in the LoginModal now — the old standalone
// pages' URLs (PATHS.passwordLogin, PATHS.register) open the modal on the
// matching form instead, keeping any "return to" path the link carried.
const LoginModalRedirect = ({ mode }: LoginModalRedirectProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fromPath = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname;
    dispatch(
      openLoginModal({
        mode,
        ...(fromPath ? { targetPath: fromPath } : {}),
      }),
    );
    navigate(PATHS.home, { replace: true });
  }, [dispatch, navigate, location.state, mode]);

  return null;
};

export default LoginModalRedirect;
