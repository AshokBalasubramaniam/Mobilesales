import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/models";
import { PATHS } from "./paths";

export interface RoleBasedRouteProps {
  requiredRoles: Role[];
  children: ReactNode;
}

const RoleBasedRoute = ({ requiredRoles, children }: RoleBasedRouteProps) => {
  const { user } = useAuth();

  if (
    requiredRoles.length > 0 &&
    (!user || !requiredRoles.includes(user.role))
  ) {
    return <Navigate to={PATHS.home} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
