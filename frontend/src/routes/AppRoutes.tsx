import { Navigate, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import BuyerLayout from "../layouts/BuyerLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import LoginModalRedirect from "./LoginModalRedirect";
import { PATHS } from "./paths";
import {
  generateProtectedRoutes,
  generateAccountRoutes,
  generateSellerRoutes,
  generateAdminRoutes,
} from "./generateRoutes";

import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

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
    {/* Email login and signup are part of the login popup — these URLs
        just open it on the right form */}
    <Route path="login/password" element={<LoginModalRedirect mode="email" />} />
    <Route path="register" element={<LoginModalRedirect mode="signup" />} />
    <Route
      path="forgot-password"
      element={<LoginModalRedirect mode="forgot" />}
    />
    {/* Email verification happens inline (EmailCodeVerifier) — send old
        links to Profile, where the "Verify email" action lives */}
    <Route
      path="verify-email"
      element={<Navigate to={PATHS.buyer.profile} replace />}
    />

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

        {/* The old seller dashboard is gone — listings and sales live in
            My Account now */}
        <Route
          path="seller/*"
          element={<Navigate to={PATHS.buyer.listings} replace />}
        />

      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>

    <Route element={<ProtectedRoute />}>
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
  </Routes>
);

export default AppRoutes;
