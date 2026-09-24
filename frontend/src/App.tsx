import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "./app/hooks";

import { bootstrapAuth } from "./features/auth/thunks";
import { logoutSuccess } from "./features/auth/slice";
import { selectLoginModalIntent } from "./features/ui/selectors";
import { closeLoginModal } from "./features/ui/slice";
import { setUnauthorizedHandler } from "./api/tokenManager";
import SocketManager from "./components/common/SocketManager";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoginModal from "./components/auth/LoginModal";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useAppDispatch();
  const loginModalIntent = useAppSelector(selectLoginModalIntent);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(logoutSuccess()));
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketManager />
        <Toaster position="top-center" />
        <AppRoutes />
        <LoginModal
          intent={loginModalIntent}
          onClose={() => dispatch(closeLoginModal())}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
