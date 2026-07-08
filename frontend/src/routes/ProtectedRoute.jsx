import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import { PATHS } from './paths';

const ProtectedRoute = ({ roles }) => {
  const { user, isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return <Spinner full />;

  if (!isAuthenticated) {
    return <Navigate to={PATHS.login} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={PATHS.home} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
