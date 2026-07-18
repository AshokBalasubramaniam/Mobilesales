import { useAppSelector } from "../app/hooks";
import {
  selectAuthError,
  selectAuthStatus,
  selectBootstrapped,
  selectUser,
} from "../features/auth/selectors";

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const bootstrapped = useAppSelector(selectBootstrapped);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  return {
    user,
    isAuthenticated: Boolean(user),
    isBuyer: user?.role === "buyer",
    isSeller: user?.role === "seller",
    isAdmin: user?.role === "admin",
    bootstrapped,
    status,
    error,
  };
};
