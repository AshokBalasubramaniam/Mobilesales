import type { Role } from "../types/models";

export const PATHS = {
  home: "/",
  search: "/mobiles",
  mobileDetail: (id = ":id") => `/mobiles/${id}`,
  compare: "/compare",
  wishlist: "/wishlist",
  chat: "/chat",
  chatConversation: (id = ":conversationId") => `/chat/${id}`,
  checkout: (mobileId = ":mobileId") => `/checkout/${mobileId}`,
  orderDetail: (id = ":id") => `/orders/${id}`,

  login: "/login",
  register: "/register",
  otpLogin: "/login/otp",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",

  sell: "/sell",
  editListing: (id = ":id") => `/sell/${id}/edit`,
  becomeSeller: "/become-seller",

  buyer: {
    root: "/account",
    profile: "/account/profile",
    orders: "/account/orders",
    wishlist: "/account/wishlist",
    coupons: "/account/coupons",
    notifications: "/account/notifications",
    reviews: "/account/reviews",
    chats: "/account/chats",
  },

  seller: {
    root: "/seller",
    overview: "/seller",
    listings: "/seller/listings",
    orders: "/seller/orders",
    earnings: "/seller/earnings",
    verification: "/seller/verification",
    chats: "/seller/chats",
  },

  admin: {
    root: "/admin",
    overview: "/admin",
    users: "/admin/users",
    listings: "/admin/listings",
    chats: "/admin/chats",
    chatConversation: (id = ":conversationId") => `/admin/chats/${id}`,
    reports: "/admin/reports",
    disputes: "/admin/disputes",
    orders: "/admin/orders",
    coupons: "/admin/coupons",
    revenue: "/admin/revenue",
    analytics: "/admin/analytics",
  },
};

export const getDashboardPath = (role: Role): string => {
  if (role === "admin") return PATHS.admin.root;
  if (role === "seller") return PATHS.seller.root;
  return PATHS.buyer.root;
};
