import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { bootstrapAuth } from './features/auth/authSlice';
import SocketManager from './components/common/SocketManager';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import BuyerLayout from './layouts/BuyerLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLES } from './utils/constants';

import Home from './pages/Home';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OtpLogin from './pages/auth/OtpLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

import Search from './pages/mobile/Search';
import MobileDetail from './pages/mobile/MobileDetail';
import SellerProfile from './pages/mobile/SellerProfile';
import Compare from './pages/mobile/Compare';
import SellPhone from './pages/mobile/SellPhone';
import Checkout from './pages/mobile/Checkout';

import EditListing from './pages/seller/EditListing';
import SellerVerification from './pages/seller/Verification';

import OrderDetail from './pages/order/OrderDetail';

import ChatLayout from './pages/chat/ChatLayout';
import ChatWindow from './pages/chat/ChatWindow';

import BuyerProfile from './pages/buyer/Profile';
import BuyerOrders from './pages/buyer/Orders';
import BuyerWishlist from './pages/buyer/Wishlist';
import BuyerCoupons from './pages/buyer/Coupons';
import BuyerNotifications from './pages/buyer/Notifications';
import BuyerReviews from './pages/buyer/Reviews';
import BuyerChats from './pages/buyer/Chats';

import SellerOverview from './pages/seller/Overview';
import SellerMyListings from './pages/seller/MyListings';
import SellerOrders from './pages/seller/Orders';
import SellerEarnings from './pages/seller/Earnings';
import SellerChats from './pages/seller/Chats';

import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminListingApprovals from './pages/admin/ListingApprovals';
import AdminChats from './pages/admin/Chats';
import AdminChatViewer from './pages/admin/ChatViewer';
import AdminReports from './pages/admin/Reports';
import AdminDisputes from './pages/admin/Disputes';
import AdminOrders from './pages/admin/Orders';
import AdminCoupons from './pages/admin/Coupons';
import AdminRevenue from './pages/admin/Revenue';
import AdminAnalytics from './pages/admin/Analytics';

import About from './pages/static/About';
import Careers from './pages/static/Careers';
import Contact from './pages/static/Contact';
import Faq from './pages/static/Faq';
import Privacy from './pages/static/Privacy';
import Terms from './pages/static/Terms';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <SocketManager />
      <Toaster position="top-center" />
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
            <Route path="wishlist" element={<BuyerWishlist />} />
            <Route path="checkout/:mobileId" element={<Checkout />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="become-seller" element={<SellerVerification />} />

            <Route path="chat" element={<ChatLayout />}>
              <Route path=":conversationId" element={<ChatWindow />} />
            </Route>

            <Route path="account" element={<BuyerLayout />}>
              <Route path="profile" element={<BuyerProfile />} />
              <Route path="orders" element={<BuyerOrders />} />
              <Route path="wishlist" element={<BuyerWishlist />} />
              <Route path="coupons" element={<BuyerCoupons />} />
              <Route path="notifications" element={<BuyerNotifications />} />
              <Route path="reviews" element={<BuyerReviews />} />
              <Route path="chats" element={<BuyerChats />} />
            </Route>

            <Route element={<ProtectedRoute roles={[ROLES.SELLER]} />}>
              <Route path="sell" element={<SellPhone />} />
              <Route path="sell/:id/edit" element={<EditListing />} />

              <Route path="seller" element={<SellerLayout />}>
                <Route index element={<SellerOverview />} />
                <Route path="listings" element={<SellerMyListings />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="earnings" element={<SellerEarnings />} />
                <Route path="verification" element={<SellerVerification />} />
                <Route path="chats" element={<SellerChats />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="listings" element={<AdminListingApprovals />} />
                <Route path="chats" element={<AdminChats />} />
                <Route path="chats/:conversationId" element={<AdminChatViewer />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="disputes" element={<AdminDisputes />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="revenue" element={<AdminRevenue />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
