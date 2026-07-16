import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice';
import wishlistReducer from '../features/wishlist/slice';
import notificationsReducer from '../features/notifications/slice';
import chatReducer from '../features/chat/slice';
import uiReducer from '../features/ui/slice';
import mobilesReducer from '../features/mobiles/slice';
import reviewsReducer from '../features/reviews/slice';
import userGroupReducer from '../features/userGroup/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    ui: uiReducer,
    mobiles: mobilesReducer,
    reviews: reviewsReducer,
    userGroup: userGroupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
