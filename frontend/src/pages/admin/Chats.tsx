import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { ArrowLeft, MessageCircle, Send, ShieldOff, UserX } from "lucide-react";
import api from "../../api/api";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import MessageBubble from "../../components/chat/MessageBubble";
import { formatCurrency, formatRelativeTime } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { ApiResponse, PaginationMeta } from "../../types/api";
import type { Conversation, Message, User } from "../../types/models";

const extractError = (err: unknown): string =>
  isAxiosError<{ message?: string }>(err)
    ? (err.response?.data?.message ?? "Something went wrong")
    : "Something went wrong";

type Participant = Pick<
  User,
  "_id" | "name" | "avatar" | "email" | "role" | "lastSeen"
>;

const asParticipants = (c: Conversation): Participant[] =>
  c.participants.filter((p): p is Participant => typeof p !== "string");

const classes = {
  wrap: "flex h-full w-full flex-col gap-4 lg:flex-row",
  listPane:
    "w-full shrink-0 flex-col rounded-2xl border border-gray-100 bg-white lg:h-full lg:w-80",
  listHeader: "border-b border-gray-100 p-4",
  listTitle: "text-lg font-semibold",
  listSub: "mt-0.5 text-xs text-gray-400",
  list: "flex-1 space-y-1 overflow-y-auto p-2",
  conversationRow:
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50",
  conversationRowActive: "bg-brand-50",
  avatarStack: "flex shrink-0 -space-x-2",
  rowContent: "min-w-0 flex-1",
  rowParticipants: "truncate text-xs font-semibold",
  rowPreview: "truncate text-[11px] text-gray-400",
  rowTime: "shrink-0 text-[10px] text-gray-400",

  centerPane:
    "w-full flex-1 flex-col rounded-2xl border border-gray-100 bg-white lg:h-full",
  centerHeader:
    "flex items-center justify-between gap-3 border-b border-gray-100 p-4",
  centerHeaderInfo: "flex min-w-0 items-center gap-3",
  backButton: "shrink-0 rounded-full p-1.5 hover:bg-gray-100 lg:hidden",
  headerParticipants: "truncate text-sm font-semibold",
  headerMobile: "truncate text-xs text-gray-400",
  messages: "flex-1 space-y-3 overflow-y-auto p-4",
  form: "flex items-center gap-2 border-t border-gray-100 p-3",
  input:
    "flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500",
  sendButton: "rounded-full bg-brand-600 p-2.5 text-white disabled:opacity-50",

  asidePane: "w-full shrink-0 space-y-4 lg:h-full lg:w-72 lg:overflow-y-auto",
  asideCard: "rounded-2xl border border-gray-100 bg-white p-4",
  asideTitle: "mb-3 text-xs font-semibold text-gray-900",
  participantRow: "mb-3 flex items-center gap-3 last:mb-0",
  participantInfo: "min-w-0 flex-1",
  participantName: "truncate text-sm font-medium",
  participantEmail: "truncate text-xs text-gray-400",
  productCard: "flex items-center gap-3",
  productImage: "size-11 rounded-lg bg-gray-100 object-cover",
  productName: "truncate text-xs font-semibold",
  productPrice: "text-xs text-gray-500",
  productLink: "mt-3 block w-full",
};

const Chats = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [blockUserTarget, setBlockUserTarget] = useState<Participant | null>(
    null,
  );
  const [blockUserReason, setBlockUserReason] = useState("");
  const [blockingUser, setBlockingUser] = useState(false);
  const [blockConvoOpen, setBlockConvoOpen] = useState(false);
  const [blockingConvo, setBlockingConvo] = useState(false);

  useEffect(() => {
    setListLoading(true);
    api
      .get<ApiResponse<Conversation[]>>("/chat/conversations/admin/all", {
        params: { page },
      })
      .then(({ data }) => {
        setConversations(data.data);
        setMeta(data.meta);
      })
      .catch((err) => {
        const message =
          isAxiosError<{ message?: string }>(err) && err.response?.data?.message;
        toast.error(message || "Failed to load conversations");
      })
      .finally(() => setListLoading(false));
  }, [page]);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      return;
    }
    setDetailLoading(true);
    Promise.all([
      api.get<ApiResponse<Conversation>>(
        `/chat/conversations/${conversationId}`,
      ),
      api.get<ApiResponse<Message[]>>(
        `/chat/conversations/${conversationId}/messages`,
        { params: { limit: 100 } },
      ),
    ])
      .then(([convRes, msgRes]) => {
        setConversation(convRes.data.data);
        setMessages(msgRes.data.data);
      })
      .catch((err) => {
        const message =
          isAxiosError<{ message?: string }>(err) && err.response?.data?.message;
        toast.error(message || "Failed to load conversation");
      })
      .finally(() => setDetailLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const socket = getSocket();
    socket?.emit("conversation:join", conversationId);

    const onMessage = (message: Message) => {
      if (message.conversation !== conversationId) return;
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message],
      );
    };
    socket?.on("message:new", onMessage);

    return () => {
      socket?.off("message:new", onMessage);
      socket?.emit("conversation:leave", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;
    setSending(true);
    try {
      await api.post(`/chat/conversations/${conversationId}/messages/text`, {
        content: text.trim(),
      });
      setText("");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSending(false);
    }
  };

  const handleBlockUser = async () => {
    if (!blockUserTarget) return;
    setBlockingUser(true);
    try {
      await api.patch(`/users/${blockUserTarget._id}/block`, {
        reason: blockUserReason,
      });
      toast.success("User blocked");
      setBlockUserTarget(null);
      setBlockUserReason("");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBlockingUser(false);
    }
  };

  const handleBlockConversation = async () => {
    if (!conversationId) return;
    setBlockingConvo(true);
    try {
      const { data } = await api.patch<ApiResponse<Conversation>>(
        `/chat/conversations/${conversationId}/block`,
      );
      setConversation(data.data);
      toast.success("Conversation blocked");
      setBlockConvoOpen(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBlockingConvo(false);
    }
  };

  return (
    <div className={classes.wrap}>
      <div
        className={`${classes.listPane} ${conversationId ? "hidden lg:flex" : "flex"}`}
      >
        <div className={classes.listHeader}>
          <h2 className={classes.listTitle}>Chats</h2>
          <p className={classes.listSub}>
            View any buyer/seller chat and reply directly for support or
            dispute mediation.
          </p>
        </div>
        {listLoading ? (
          <Spinner full />
        ) : conversations.length === 0 ? (
          <EmptyState icon={MessageCircle} title="No conversations yet" />
        ) : (
          <div className={classes.list}>
            {conversations.map((c) => {
              const participants = asParticipants(c);
              return (
                <button
                  key={c._id}
                  onClick={() => navigate(`/admin/chats/${c._id}`)}
                  className={`${classes.conversationRow} ${c._id === conversationId ? classes.conversationRowActive : ""}`}
                >
                  <div className={classes.avatarStack}>
                    {participants.map((p) => (
                      <Avatar key={p._id} src={p.avatar} name={p.name} size="sm" />
                    ))}
                  </div>
                  <div className={classes.rowContent}>
                    <p className={classes.rowParticipants}>
                      {participants.map((p) => p.name).join(" ↔ ")}
                    </p>
                    <p className={classes.rowPreview}>
                      {c.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                  {c.isBlocked && <Badge variant="red">Blocked</Badge>}
                  <span className={classes.rowTime}>
                    {formatRelativeTime(c.updatedAt)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <div
        className={`${classes.centerPane} ${conversationId ? "flex" : "hidden lg:flex"}`}
      >
        {!conversationId ? (
          <EmptyState
            icon={MessageCircle}
            title="Select a conversation"
            description="Pick a conversation from the list to view messages."
          />
        ) : detailLoading || !conversation ? (
          <Spinner full />
        ) : (
          <>
            <div className={classes.centerHeader}>
              <div className={classes.centerHeaderInfo}>
                <button
                  onClick={() => navigate(PATHS.admin.chats)}
                  className={classes.backButton}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <div className={classes.avatarStack}>
                  {asParticipants(conversation).map((p) => (
                    <Avatar key={p._id} src={p.avatar} name={p.name} size="sm" />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className={classes.headerParticipants}>
                    {asParticipants(conversation)
                      .map((p) => p.name)
                      .join(" ↔ ")}
                  </p>
                  {conversation.mobile && (
                    <p className={classes.headerMobile}>
                      Re: {conversation.mobile.brand} {conversation.mobile.model}
                    </p>
                  )}
                </div>
              </div>
              {conversation.isBlocked && <Badge variant="red">Blocked</Badge>}
            </div>

            <div className={classes.messages}>
              {messages.map((message) => {
                const senderId =
                  typeof message.sender === "string"
                    ? message.sender
                    : message.sender?._id;
                const isOwn = senderId === user?._id;
                return (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={isOwn}
                    senderLabel={
                      !isOwn && typeof message.sender !== "string"
                        ? message.sender?.name
                        : undefined
                    }
                    onRespondOffer={() => {}}
                  />
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className={classes.form}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply as MAPZHA Support..."
                className={classes.input}
                disabled={conversation.isBlocked}
              />
              <button
                type="submit"
                disabled={sending || !text.trim() || conversation.isBlocked}
                className={classes.sendButton}
              >
                <Send className="size-4" />
              </button>
            </form>
          </>
        )}
      </div>

      {conversation && (
        <div className={classes.asidePane}>
          <div className={classes.asideCard}>
            <h4 className={classes.asideTitle}>Participants</h4>
            {asParticipants(conversation).map((p) => (
              <div key={p._id} className={classes.participantRow}>
                <Avatar src={p.avatar} name={p.name} size="sm" />
                <div className={classes.participantInfo}>
                  <p className={classes.participantName}>{p.name}</p>
                  <p className={classes.participantEmail}>{p.email}</p>
                </div>
                <Badge variant={p.role === "seller" ? "green" : "brand"}>
                  {p.role}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={UserX}
                  onClick={() => setBlockUserTarget(p)}
                  aria-label={`Block ${p.name}`}
                />
              </div>
            ))}
          </div>

          {conversation.mobile && (
            <div className={classes.asideCard}>
              <h4 className={classes.asideTitle}>Product Details</h4>
              <div className={classes.productCard}>
                <img
                  src={conversation.mobile.images?.[0]?.url}
                  alt=""
                  className={classes.productImage}
                />
                <div className="min-w-0">
                  <p className={classes.productName}>
                    {conversation.mobile.brand} {conversation.mobile.model}
                  </p>
                  <p className={classes.productPrice}>
                    {formatCurrency(conversation.mobile.price)}
                  </p>
                </div>
              </div>
              <Link
                to={PATHS.mobileDetail(conversation.mobile._id)}
                className={classes.productLink}
              >
                <Button size="sm" variant="secondary" className="w-full">
                  View Product
                </Button>
              </Link>
            </div>
          )}

          <div className={classes.asideCard}>
            <h4 className={classes.asideTitle}>Conversation Actions</h4>
            {conversation.isBlocked ? (
              <Badge variant="red">This conversation is blocked</Badge>
            ) : (
              <Button
                size="sm"
                variant="danger"
                icon={ShieldOff}
                className="w-full"
                onClick={() => setBlockConvoOpen(true)}
              >
                Block Conversation
              </Button>
            )}
          </div>
        </div>
      )}

      <Modal
        open={!!blockUserTarget}
        onClose={() => setBlockUserTarget(null)}
        title={blockUserTarget ? `Block ${blockUserTarget.name}` : ""}
      >
        <Textarea
          label="Reason"
          required
          value={blockUserReason}
          onChange={(e) => setBlockUserReason(e.target.value)}
        />
        <Button
          variant="danger"
          className="mt-4 w-full"
          onClick={handleBlockUser}
          loading={blockingUser}
          disabled={!blockUserReason}
        >
          Block User
        </Button>
      </Modal>

      <ConfirmDialog
        open={blockConvoOpen}
        onClose={() => setBlockConvoOpen(false)}
        onConfirm={handleBlockConversation}
        loading={blockingConvo}
        title="Block this conversation?"
        description="Both participants will no longer be able to send messages here."
        confirmLabel="Block"
      />
    </div>
  );
};

export default Chats;
