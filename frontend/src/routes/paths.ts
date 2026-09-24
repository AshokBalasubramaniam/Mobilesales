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

  // Old auth page URLs — these open the login popup on the matching form
  // (LoginModalRedirect); verifyEmail redirects to Profile.
  register: "/register",
  passwordLogin: "/login/password",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",

  sell: "/sell",
  editListing: (id = ":id") => `/sell/${id}/edit`,
  becomeSeller: "/become-seller",

  buyer: {
    root: "/account",
    profile: "/account/profile",
    orders: "/account/orders",
    listings: "/account/listings",
    sales: "/account/sales",
    wishlist: "/account/wishlist",
    coupons: "/account/coupons",
    notifications: "/account/notifications",
    reviews: "/account/reviews",
    chats: "/account/chats",
  },

  admin: {
    root: "/admin",
    overview: "/admin",
    users: "/admin/users",
    products: "/admin/products",
    listings: "/admin/listings",
    chats: "/admin/chats",
    chatConversation: (id = ":conversationId") => `/admin/chats/${id}`,
    reports: "/admin/reports",
    disputes: "/admin/disputes",
    orders: "/admin/orders",
    coupons: "/admin/coupons",
    revenue: "/admin/revenue",
    analytics: "/admin/analytics",
    settings: "/admin/settings",
  },
};

export const getDashboardPath = (role: Role): string => {
  // Buyers and sellers share My Account (there's no separate seller dashboard)
  if (role === "admin") return PATHS.admin.root;
  return PATHS.buyer.profile;
};
