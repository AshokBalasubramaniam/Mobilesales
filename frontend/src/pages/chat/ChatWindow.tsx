import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchMessages } from "../../features/chat/thunks";
import { setActiveConversation } from "../../features/chat/slice";
import {
  selectConversations,
  selectLastSeenByUserId,
  selectMessagesForConversation,
  selectOnlineUserIds,
  selectTypingForConversation,
} from "../../features/chat/selectors";
import { formatRelativeTime } from "../../utils/format";
import api from "../../api/api";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../../hooks/useAuth";
import { useVideoCall } from "../../hooks/useVideoCall";
import MessageBubble from "../../components/chat/MessageBubble";
import ChatComposer from "../../components/chat/ChatComposer";
import VideoCallModal, {
  CallButton,
} from "../../components/chat/VideoCallModal";
import Avatar from "../../components/common/Avatar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { PATHS } from "../../routes/paths";
import type { OfferStatus, User } from "../../types/models";


type ChatParticipant = Pick<
  User,
  "_id" | "name" | "avatar" | "lastSeen" | "sellerProfile"
>;

const classes = {
  container: "flex h-full flex-col",
  header:
    "flex items-center gap-3 border-b border-gray-200 p-3",
  backButton:
    "rounded-full p-1.5 hover:bg-gray-100 lg:hidden",
  backIcon: "size-5",
  headerInfo: "min-w-0 flex-1",
  headerName: "flex items-center gap-1 truncate text-sm font-semibold",
  verifiedIcon: "size-3.5 text-brand-600",
  headerStatus: "text-xs text-gray-400",
  messages: "flex-1 space-y-3 overflow-y-auto p-4",
  offerForm: "space-y-4",
  sendOfferButton: "w-full",
};

const ChatWindow = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversations = useAppSelector(selectConversations);
  const conversation = conversations.find((c) => c._id === conversationId);
  const messages = useAppSelector(
    selectMessagesForConversation(conversationId),
  );
  const typingUserIds = useAppSelector(
    selectTypingForConversation(conversationId),
  );
  const onlineUserIds = useAppSelector(selectOnlineUserIds);
  const lastSeenByUserId = useAppSelector(selectLastSeenByUserId);
  const [loading, setLoading] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");

  const participants = conversation?.participants as
    | ChatParticipant[]
    | undefined;
  const otherUser = (participants?.find((p) => p._id !== user?._id) ||
    conversation?.otherParticipant) as ChatParticipant | undefined;
  const isOtherOnline = Boolean(
    otherUser?._id && onlineUserIds.includes(otherUser._id),
  );
  const otherLastSeen =
    (otherUser?._id && lastSeenByUserId[otherUser._id]) || otherUser?.lastSeen;
  const call = useVideoCall({
    conversationId: conversationId ?? "",
    otherUserId: otherUser?._id,
  });

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    dispatch(setActiveConversation(conversationId));
    dispatch(fetchMessages({ conversationId })).finally(() =>
      setLoading(false),
    );

    const socket = getSocket();
    socket?.emit("conversation:join", conversationId);
    socket?.emit("message:read", { conversationId });

    return () => {
      socket?.emit("conversation:leave", conversationId);
    };
  }, [conversationId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length) getSocket()?.emit("message:read", { conversationId });
  }, [messages.length, conversationId]);

  const handleRespondOffer = async (messageId: string, status: OfferStatus) => {
    if (!conversationId) return;
    try {
      await api.patch(
        `/chat/conversations/${conversationId}/messages/${messageId}/offer`,
        { status },
      );
    } catch {
      toast.error("Could not respond to offer");
    }
  };

  const handleSendOffer = async (e: FormEvent) => {
    e.preventDefault();
    if (!conversationId) return;
    try {
      await api.post(`/chat/conversations/${conversationId}/messages/offer`, {
        amount: Number(offerAmount),
      });
      setOfferModalOpen(false);
      setOfferAmount("");
    } catch {
      toast.error("Could not send offer");
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <button
          onClick={() => navigate(PATHS.chat)}
          className={classes.backButton}
        >
          <ArrowLeft className={classes.backIcon} />
        </button>
        <Avatar
          src={otherUser?.avatar}
          name={otherUser?.name}
          online={isOtherOnline}
        />
        <div className={classes.headerInfo}>
          <p className={classes.headerName}>
            {otherUser?.name}{" "}
            {otherUser?.sellerProfile?.isVerified && (
              <BadgeCheck className={classes.verifiedIcon} />
            )}
          </p>
          <p className={classes.headerStatus}>
            {typingUserIds.length
              ? "Typing..."
              : isOtherOnline
                ? "Online"
                : otherLastSeen
                  ? `Last seen ${formatRelativeTime(otherLastSeen)}`
                  : "Offline"}
          </p>
        </div>
        <CallButton onClick={call.startCall} />
      </div>

      <div className={classes.messages}>
        {messages.map((message) => {
          const sender =
            typeof message.sender === "string" ? undefined : message.sender;
          const senderId =
            typeof message.sender === "string"
              ? message.sender
              : message.sender._id;
          const isOwn = senderId === user?._id;
          const isThirdParty = !isOwn && senderId !== otherUser?._id;
          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              senderLabel={
                isThirdParty
                  ? `${sender?.name || "Support"}${sender?.role === "admin" ? " (Mobile Sales Support)" : ""}`
                  : undefined
              }
              onRespondOffer={handleRespondOffer}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatComposer
        conversationId={conversationId ?? ""}
        onOfferClick={() => setOfferModalOpen(true)}
      />

      <Modal
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title="Send an offer"
      >
        <form onSubmit={handleSendOffer} className={classes.offerForm}>
          <Input
            label="Offer amount (₹)"
            type="number"
            required
            autoFocus
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
          />
          <Button type="submit" className={classes.sendOfferButton}>
            Send Offer
          </Button>
        </form>
      </Modal>

      <VideoCallModal call={call} otherUser={otherUser} />
    </div>
  );
};

export default ChatWindow;
