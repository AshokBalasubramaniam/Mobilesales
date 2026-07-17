import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { MessageCircle, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchConversations } from "../../features/chat/thunks";
import {
  selectConversations,
  selectConversationsStatus,
  selectOnlineUserIds,
} from "../../features/chat/selectors";
import Avatar from "../common/Avatar";
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";
import Button from "../common/Button";
import { formatRelativeTime } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";
import type { User } from "../../types/models";

type ConversationParticipant = Pick<
  User,
  "_id" | "name" | "avatar" | "email" | "role" | "lastSeen"
>;

const classes = {
  container: "divide-y divide-gray-100",
  link: "flex items-center gap-3 p-3.5 hover:bg-gray-50",
  linkActive: "bg-brand-50",
  content: "min-w-0 flex-1",
  row: "flex items-center justify-between",
  name: "truncate text-sm font-semibold",
  timestamp: "shrink-0 text-[11px] text-gray-400",
  lastMessage: "truncate text-xs text-gray-500",
  unreadBadge:
    "ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white",
  mobileInfo: "truncate text-[11px] text-gray-400",
};

const ConversationList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversationId } = useParams();
  const conversations = useAppSelector(selectConversations);
  const conversationsStatus = useAppSelector(selectConversationsStatus);
  const onlineUserIds = useAppSelector(selectOnlineUserIds);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  if (conversationsStatus === "loading") return <Spinner full />;

  if (!conversations.length) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        description="Chats start from a listing or seller profile — browse phones and message a seller to get talking."
        action={
          <Button
            size="sm"
            icon={Search}
            onClick={() => navigate(PATHS.search)}
          >
            Browse Phones
          </Button>
        }
      />
    );
  }

  return (
    <div className={classes.container}>
      {conversations.map((conv) => {
        const participants = conv.participants as ConversationParticipant[];
        const other =
          participants.find((p) => p._id !== user?._id) ||
          conv.otherParticipant;
        const isOnline = Boolean(
          other?._id && onlineUserIds.includes(other._id),
        );
        return (
          <Link
            key={conv._id}
            to={`/chat/${conv._id}`}
            className={clsx(
              classes.link,
              conversationId === conv._id && classes.linkActive,
            )}
          >
            <Avatar src={other?.avatar} name={other?.name} online={isOnline} />
            <div className={classes.content}>
              <div className={classes.row}>
                <span className={classes.name}>{other?.name}</span>
                {conv.lastMessage?.sentAt && (
                  <span className={classes.timestamp}>
                    {formatRelativeTime(conv.lastMessage.sentAt)}
                  </span>
                )}
              </div>
              <div className={classes.row}>
                <p className={classes.lastMessage}>
                  {conv.lastMessage?.text || "Start the conversation"}
                </p>
                {(conv.unreadCount ?? 0) > 0 && (
                  <span className={classes.unreadBadge}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.mobile && (
                <p className={classes.mobileInfo}>
                  Re: {conv.mobile.brand} {conv.mobile.model}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ConversationList;
