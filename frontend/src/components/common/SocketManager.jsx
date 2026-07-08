import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from '../../lib/socket';
import { getAccessToken } from '../../api/tokenManager';
import { messageAppended, presenceUpdated, typingUpdated, offerStatusUpdated } from '../../features/chat/chatSlice';
import { notificationReceived } from '../../features/notifications/notificationsSlice';

/** Mounted once at the app root; owns the socket lifecycle and fans server events out to Redux. */
const SocketManager = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const bootstrapped = useSelector((state) => state.auth.bootstrapped);

  useEffect(() => {
    if (!bootstrapped || !user) return undefined;

    const socket = connectSocket(getAccessToken());

    socket.on('message:new', (message) => dispatch(messageAppended(message)));
    socket.on('presence:online', ({ userId }) => dispatch(presenceUpdated({ userId, online: true })));
    socket.on('presence:offline', ({ userId }) => dispatch(presenceUpdated({ userId, online: false })));
    socket.on('typing:start', ({ conversationId, userId }) => dispatch(typingUpdated({ conversationId, userId, isTyping: true })));
    socket.on('typing:stop', ({ conversationId, userId }) => dispatch(typingUpdated({ conversationId, userId, isTyping: false })));
    socket.on('offer:response', ({ messageId, status }) => dispatch(offerStatusUpdated({ messageId, status })));
    socket.on('notification:new', (notification) => {
      dispatch(notificationReceived(notification));
      toast(notification.title, { icon: '🔔' });
    });

    return () => {
      socket.removeAllListeners();
      disconnectSocket();
    };
  }, [user, bootstrapped, dispatch]);

  return null;
};

export default SocketManager;
