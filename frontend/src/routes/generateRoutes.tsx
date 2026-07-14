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
import SellerOverview from "../pages/seller/Overview";
import SellerMyListings from "../pages/seller/MyListings";
import SellerOrders from "../pages/seller/Orders";
import SellerEarnings from "../pages/seller/Earnings";
import SellerChats from "../pages/seller/Chats";

import AdminOverview from "../pages/admin/Overview";
import AdminUsers from "../pages/admin/Users";
import AdminListingApprovals from "../pages/admin/ListingApprovals";
import AdminChats from "../pages/admin/Chats";
import AdminChatViewer from "../pages/admin/ChatViewer";
import AdminReports from "../pages/admin/Reports";
import AdminDisputes from "../pages/admin/Disputes";
import AdminOrders from "../pages/admin/Orders";
import AdminCoupons from "../pages/admin/Coupons";
import AdminRevenue from "../pages/admin/Revenue";
import AdminAnalytics from "../pages/admin/Analytics";

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
  { path: "wishlist", element: <BuyerWishlist />, requiredRoles: [] },
  { path: "coupons", element: <BuyerCoupons />, requiredRoles: [] },
  { path: "notifications", element: <BuyerNotifications />, requiredRoles: [] },
  { path: "reviews", element: <BuyerReviews />, requiredRoles: [] },
  { path: "chats", element: <BuyerChats />, requiredRoles: [] },
];

// Flat, seller-gated leaves that sit alongside the /seller dashboard (not inside SellerLayout).
export const generateSellerRoutes = (): RouteConfig[] => [
  { path: "sell", element: <SellPhone />, requiredRoles: [ROLES.SELLER] },
  {
    path: "sell/:id/edit",
    element: <EditListing />,
    requiredRoles: [ROLES.SELLER],
  },
];

// Rendered under /seller (SellerLayout) — seller role required.
export const generateSellerDashboardRoutes = (): RouteConfig[] => [
  { index: true, element: <SellerOverview />, requiredRoles: [ROLES.SELLER] },
  {
    path: "listings",
    element: <SellerMyListings />,
    requiredRoles: [ROLES.SELLER],
  },
  { path: "orders", element: <SellerOrders />, requiredRoles: [ROLES.SELLER] },
  {
    path: "earnings",
    element: <SellerEarnings />,
    requiredRoles: [ROLES.SELLER],
  },
  {
    path: "verification",
    element: <SellerVerification />,
    requiredRoles: [ROLES.SELLER],
  },
  { path: "chats", element: <SellerChats />, requiredRoles: [ROLES.SELLER] },
];

// Rendered under /admin (AdminLayout) — admin role required.
export const generateAdminRoutes = (): RouteConfig[] => [
  { index: true, element: <AdminOverview />, requiredRoles: [ROLES.ADMIN] },
  { path: "users", element: <AdminUsers />, requiredRoles: [ROLES.ADMIN] },
  {
    path: "listings",
    element: <AdminListingApprovals />,
    requiredRoles: [ROLES.ADMIN],
  },
  { path: "chats", element: <AdminChats />, requiredRoles: [ROLES.ADMIN] },
  {
    path: "chats/:conversationId",
    element: <AdminChatViewer />,
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
];
