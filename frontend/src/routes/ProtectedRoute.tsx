import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../app/hooks";
import { openLoginModal } from "../features/ui/slice";
import Spinner from "../components/common/Spinner";
import EmailVerificationNotice from "../components/auth/EmailVerificationNotice";
import { ROLES } from "../utils/constants";
import type { Role } from "../types/models";
import { PATHS } from "./paths";

export interface ProtectedRouteProps {
  roles?: Role[];
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // No standalone login page anymore — send the visitor back to a safe
  // page while the global login popup opens with this page as its target,
  // so a successful login lands them right back here.
  useEffect(() => {
    if (bootstrapped && !isAuthenticated) {
      dispatch(openLoginModal({ targetPath: location.pathname }));
    }
  }, [bootstrapped, isAuthenticated, location.pathname, dispatch]);

  if (!bootstrapped) return <Spinner full />;

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.home} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={PATHS.home} replace />;
  }

  if (roles?.includes(ROLES.ADMIN) && !user.isEmailVerified) {
    return <EmailVerificationNotice fullPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
