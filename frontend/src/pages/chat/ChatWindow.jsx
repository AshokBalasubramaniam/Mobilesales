import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { fetchMessages, setActiveConversation } from '../../features/chat/chatSlice';
import { chatApi } from '../../api/chat.api';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../hooks/useAuth';
import { useVideoCall } from '../../hooks/useVideoCall';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';
import VideoCallModal, { CallButton } from '../../components/chat/VideoCallModal';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { PATHS } from '../../routes/paths';

const ChatWindow = () => {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const conversation = useSelector((state) => state.chat.conversations.find((c) => c._id === conversationId));
  const messages = useSelector((state) => state.chat.messagesByConversation[conversationId] || []);
  const typingUserIds = useSelector((state) => state.chat.typingByConversation[conversationId] || []);
  const onlineUserIds = useSelector((state) => state.chat.onlineUserIds);
  const [loading, setLoading] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');

  const otherUser = conversation?.participants?.find((p) => p._id !== user._id) || conversation?.otherParticipant;
  const call = useVideoCall({ conversationId, otherUserId: otherUser?._id });

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    dispatch(setActiveConversation(conversationId));
    dispatch(fetchMessages({ conversationId })).finally(() => setLoading(false));

    const socket = getSocket();
    socket?.emit('conversation:join', conversationId);
    socket?.emit('message:read', { conversationId });

    return () => socket?.emit('conversation:leave', conversationId);
  }, [conversationId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length) getSocket()?.emit('message:read', { conversationId });
  }, [messages.length, conversationId]);

  const handleRespondOffer = async (messageId, status) => {
    try {
      await chatApi.respondOffer(conversationId, messageId, { status });
    } catch {
      toast.error('Could not respond to offer');
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    try {
      await chatApi.sendOffer(conversationId, Number(offerAmount));
      setOfferModalOpen(false);
      setOfferAmount('');
    } catch {
      toast.error('Could not send offer');
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 p-3 dark:border-gray-800">
        <button onClick={() => navigate(PATHS.chat)} className="rounded-full p-1.5 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800">
          <ArrowLeft className="size-5" />
        </button>
        <Avatar src={otherUser?.avatar} name={otherUser?.name} online={onlineUserIds.includes(otherUser?._id)} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-semibold">
            {otherUser?.name} {otherUser?.sellerProfile?.isVerified && <BadgeCheck className="size-3.5 text-brand-600" />}
          </p>
          <p className="text-xs text-gray-400">
            {typingUserIds.length ? 'Typing...' : onlineUserIds.includes(otherUser?._id) ? 'Online' : 'Offline'}
          </p>
        </div>
        <CallButton onClick={call.startCall} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const senderId = message.sender?._id || message.sender;
          const isOwn = senderId === user._id;
          const isThirdParty = !isOwn && senderId !== otherUser?._id;
          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              senderLabel={isThirdParty ? `${message.sender?.name || 'Support'}${message.sender?.role === 'admin' ? ' (Mobile Sales Support)' : ''}` : null}
              onRespondOffer={handleRespondOffer}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatComposer conversationId={conversationId} onOfferClick={() => setOfferModalOpen(true)} />

      <Modal open={offerModalOpen} onClose={() => setOfferModalOpen(false)} title="Send an offer">
        <form onSubmit={handleSendOffer} className="space-y-4">
          <Input label="Offer amount (₹)" type="number" required autoFocus value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
          <Button type="submit" className="w-full">
            Send Offer
          </Button>
        </form>
      </Modal>

      <VideoCallModal call={call} otherUser={otherUser} />
    </div>
  );
};

export default ChatWindow;
