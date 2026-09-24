import type { ReactNode } from "react";
import type { Role } from "../types/models";
import { ROLES } from "../utils/constants";

import BuyerWishlist from "../pages/buyer/Wishlist";
import Checkout from "../pages/mobile/Checkout";
import OrderDetail from "../pages/order/OrderDetail";
import SellerVerification from "../pages/seller/Verification";

import BuyerProfile from "../pages/buyer/Profile";
import BuyerOrders from "../pages/buyer/Orders";
import BuyerCoupons from "../pages/buyer/Coupons";
import BuyerNotifications from "../pages/buyer/Notifications";
import BuyerReviews from "../pages/buyer/Reviews";
import BuyerChats from "../pages/buyer/Chats";

import SellPhone from "../pages/mobile/SellPhone";
import EditListing from "../pages/seller/EditListing";
import SellerMyListings from "../pages/seller/MyListings";
import SellerOrders from "../pages/seller/Orders";

import AdminOverview from "../pages/admin/Overview";
import AdminUsers from "../pages/admin/Users";
import AdminProducts from "../pages/admin/Products";
import AdminListingApprovals from "../pages/admin/ListingApprovals";
import AdminChats from "../pages/admin/Chats";
import AdminReports from "../pages/admin/Reports";
import AdminDisputes from "../pages/admin/Disputes";
import AdminOrders from "../pages/admin/Orders";
import AdminCoupons from "../pages/admin/Coupons";
import AdminRevenue from "../pages/admin/Revenue";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminSettings from "../pages/admin/Settings";

export interface RouteConfig {
  path?: string;
  index?: boolean;
  element: ReactNode;
  requiredRoles: Role[];
}

// Rendered directly under MainLayout's <ProtectedRoute /> — any signed-in role.
export const generateProtectedRoutes = (): RouteConfig[] => [
  { path: "wishlist", element: <BuyerWishlist />, requiredRoles: [] },
  { path: "checkout/:mobileId", element: <Checkout />, requiredRoles: [] },
  { path: "orders/:id", element: <OrderDetail />, requiredRoles: [] },
  { path: "become-seller", element: <SellerVerification />, requiredRoles: [] },
];

// Rendered under /account (BuyerLayout) — any signed-in role.
export const generateAccountRoutes = (): RouteConfig[] => [
  { path: "profile", element: <BuyerProfile />, requiredRoles: [] },
  { path: "orders", element: <BuyerOrders />, requiredRoles: [] },
  { path: "listings", element: <SellerMyListings />, requiredRoles: [] },
  { path: "sales", element: <SellerOrders />, requiredRoles: [] },
  { path: "wishlist", element: <BuyerWishlist />, requiredRoles: [] },
  { path: "coupons", element: <BuyerCoupons />, requiredRoles: [] },
  { path: "notifications", element: <BuyerNotifications />, requiredRoles: [] },
  { path: "reviews", element: <BuyerReviews />, requiredRoles: [] },
  { path: "chats", element: <BuyerChats />, requiredRoles: [] },
];

// Flat leaves that sit alongside the /seller dashboard (not inside
// the account area) — any signed-in user can list a device, no separate seller
// role/signup required.
export const generateSellerRoutes = (): RouteConfig[] => [
  { path: "sell", element: <SellPhone />, requiredRoles: [] },
  {
    path: "sell/:id/edit",
    element: <EditListing />,
    requiredRoles: [],
  },
];

// Rendered under /admin (AdminLayout) — admin role required.
export const generateAdminRoutes = (): RouteConfig[] => [
  { index: true, element: <AdminOverview />, requiredRoles: [ROLES.ADMIN] },
  { path: "users", element: <AdminUsers />, requiredRoles: [ROLES.ADMIN] },
  {
    path: "products",
    element: <AdminProducts />,
    requiredRoles: [ROLES.ADMIN],
  },
  {
    path: "listings",
    element: <AdminListingApprovals />,
    requiredRoles: [ROLES.ADMIN],
  },
  { path: "chats", element: <AdminChats />, requiredRoles: [ROLES.ADMIN] },
  {
    path: "chats/:conversationId",
    element: <AdminChats />,
    requiredRoles: [ROLES.ADMIN],
  },
  { path: "reports", element: <AdminReports />, requiredRoles: [ROLES.ADMIN] },
  {
    path: "disputes",
    element: <AdminDisputes />,
    requiredRoles: [ROLES.ADMIN],
  },
  { path: "orders", element: <AdminOrders />, requiredRoles: [ROLES.ADMIN] },
  { path: "coupons", element: <AdminCoupons />, requiredRoles: [ROLES.ADMIN] },
  { path: "revenue", element: <AdminRevenue />, requiredRoles: [ROLES.ADMIN] },
  {
    path: "analytics",
    element: <AdminAnalytics />,
    requiredRoles: [ROLES.ADMIN],
  },
  {
    path: "settings",
    element: <AdminSettings />,
    requiredRoles: [ROLES.ADMIN],
  },
];
