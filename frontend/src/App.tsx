import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch } from "./app/hooks";

import { bootstrapAuth } from "./features/auth/thunks";
import { logoutSuccess } from "./features/auth/slice";
import { setUnauthorizedHandler } from "./api/tokenManager";
import SocketManager from "./components/common/SocketManager";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useAppDispatch();

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
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
