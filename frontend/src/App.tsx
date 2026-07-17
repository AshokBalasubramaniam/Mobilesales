import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch } from "./app/hooks";

import { bootstrapAuth } from "./features/auth/thunks";
import SocketManager from "./components/common/SocketManager";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <SocketManager />
      <Toaster position="top-center" />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
