import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import BuyerLayout from "../layouts/BuyerLayout";
import SellerLayout from "../layouts/SellerLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import {
  generateProtectedRoutes,
  generateAccountRoutes,
  generateSellerRoutes,
  generateSellerDashboardRoutes,
  generateAdminRoutes,
} from "./generateRoutes";

import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OtpLogin from "../pages/auth/OtpLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

import Search from "../pages/mobile/Search";
import MobileDetail from "../pages/mobile/MobileDetail";
import SellerProfile from "../pages/mobile/SellerProfile";
import Compare from "../pages/mobile/Compare";

import ChatLayout from "../pages/chat/ChatLayout";
import ChatWindow from "../pages/chat/ChatWindow";

import About from "../pages/static/About";
import Careers from "../pages/static/Careers";
import Contact from "../pages/static/Contact";
import Faq from "../pages/static/Faq";
import Privacy from "../pages/static/Privacy";
import Terms from "../pages/static/Terms";

const AppRoutes = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path="login" element={<Login />} />
      <Route path="login/otp" element={<OtpLogin />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="verify-email" element={<VerifyEmail />} />
    </Route>

    <Route element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="mobiles" element={<Search />} />
      <Route path="mobiles/:id" element={<MobileDetail />} />
      <Route path="users/:id" element={<SellerProfile />} />
      <Route path="compare" element={<Compare />} />

      <Route path="about" element={<About />} />
      <Route path="careers" element={<Careers />} />
      <Route path="contact" element={<Contact />} />
      <Route path="faq" element={<Faq />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="terms" element={<Terms />} />

      <Route element={<ProtectedRoute />}>
        {generateProtectedRoutes().map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RoleBasedRoute requiredRoles={route.requiredRoles}>
                {route.element}
              </RoleBasedRoute>
            }
          />
        ))}

        <Route path="chat" element={<ChatLayout />}>
          <Route path=":conversationId" element={<ChatWindow />} />
        </Route>

        <Route path="account" element={<BuyerLayout />}>
          {generateAccountRoutes().map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RoleBasedRoute requiredRoles={route.requiredRoles}>
                  {route.element}
                </RoleBasedRoute>
              }
            />
          ))}
        </Route>

        {generateSellerRoutes().map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RoleBasedRoute requiredRoles={route.requiredRoles}>
                {route.element}
              </RoleBasedRoute>
            }
          />
        ))}

        <Route path="seller" element={<SellerLayout />}>
          {generateSellerDashboardRoutes().map((route) => (
            <Route
              key={route.path ?? "index"}
              index={route.index}
              path={route.path}
              element={
                <RoleBasedRoute requiredRoles={route.requiredRoles}>
                  {route.element}
                </RoleBasedRoute>
              }
            />
          ))}
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          {generateAdminRoutes().map((route) => (
            <Route
              key={route.path ?? "index"}
              index={route.index}
              path={route.path}
              element={
                <RoleBasedRoute requiredRoles={route.requiredRoles}>
                  {route.element}
                </RoleBasedRoute>
              }
            />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AppRoutes;
