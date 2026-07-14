import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { connectSocket, disconnectSocket } from '../../lib/socket';
import { getAccessToken } from '../../api/tokenManager';
import {
  messageAppended,
  presenceUpdated,
  presenceSnapshot,
  typingUpdated,
  offerStatusUpdated,
  type OfferStatusUpdatedPayload,
  type PresenceUpdatedPayload,
  type TypingUpdatedPayload,
} from '../../features/chat/slice';
import { notificationReceived } from '../../features/notifications/slice';
import { selectBootstrapped, selectUser } from '../../features/auth/selectors';
import type { Message, Notification } from '../../types/models';

/** Mounted once at the app root; owns the socket lifecycle and fans server events out to Redux. */
const SocketManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const bootstrapped = useAppSelector(selectBootstrapped);

  useEffect(() => {
    if (!bootstrapped || !user) return undefined;

    const socket = connectSocket(getAccessToken());

    socket.on('message:new', (message: Message) => dispatch(messageAppended(message)));
    socket.on('presence:online', ({ userId }: { userId: string }) => dispatch(presenceUpdated({ userId, online: true })));
    socket.on('presence:offline', ({ userId, lastSeen }: PresenceUpdatedPayload) => dispatch(presenceUpdated({ userId, online: false, lastSeen })));
    socket.on('presence:snapshot', (onlineUserIds: string[]) => dispatch(presenceSnapshot(onlineUserIds)));
    socket.on('typing:start', ({ conversationId, userId }: TypingUpdatedPayload) => dispatch(typingUpdated({ conversationId, userId, isTyping: true })));
    socket.on('typing:stop', ({ conversationId, userId }: TypingUpdatedPayload) => dispatch(typingUpdated({ conversationId, userId, isTyping: false })));
    socket.on('offer:response', ({ messageId, status }: OfferStatusUpdatedPayload) => dispatch(offerStatusUpdated({ messageId, status })));
    socket.on('notification:new', (notification: Notification) => {
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
