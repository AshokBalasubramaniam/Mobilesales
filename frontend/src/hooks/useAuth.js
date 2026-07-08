import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, bootstrapped, status, error } = useSelector((state) => state.auth);
  return {
    user,
    isAuthenticated: Boolean(user),
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    bootstrapped,
    status,
    error,
  };
};
