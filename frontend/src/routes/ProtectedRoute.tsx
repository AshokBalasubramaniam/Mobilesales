import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import EmailVerificationNotice from '../components/auth/EmailVerificationNotice';
import { ROLES } from '../utils/constants';
import type { Role } from '../types/models';
import { PATHS } from './paths';

export interface ProtectedRouteProps {
  roles?: Role[];
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return <Spinner full />;

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.login} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={PATHS.home} replace />;
  }

  // Admin access additionally requires a verified email, on top of the role check above.
  if (roles?.includes(ROLES.ADMIN) && !user.isEmailVerified) {
    return <EmailVerificationNotice fullPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
