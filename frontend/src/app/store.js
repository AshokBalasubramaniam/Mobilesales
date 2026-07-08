import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import chatReducer from '../features/chat/chatSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
});
