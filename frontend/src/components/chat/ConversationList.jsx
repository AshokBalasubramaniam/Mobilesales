import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { fetchConversations } from '../../features/chat/chatSlice';
import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';
import { formatRelativeTime } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { MessageCircle, Search } from 'lucide-react';
import Button from '../common/Button';
import { PATHS } from '../../routes/paths';

const ConversationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversationId } = useParams();
  const { conversations, conversationsStatus, onlineUserIds } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  if (conversationsStatus === 'loading') return <Spinner full />;

  if (!conversations.length) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        description="Chats start from a listing or seller profile — browse phones and message a seller to get talking."
        action={
          <Button size="sm" icon={Search} onClick={() => navigate(PATHS.search)}>
            Browse Phones
          </Button>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {conversations.map((conv) => {
        const other = conv.participants.find((p) => p._id !== user._id) || conv.otherParticipant;
        const isOnline = onlineUserIds.includes(other?._id);
        return (
          <Link
            key={conv._id}
            to={`/chat/${conv._id}`}
            className={clsx(
              'flex items-center gap-3 p-3.5 hover:bg-gray-50 dark:hover:bg-gray-900',
              conversationId === conv._id && 'bg-brand-50 dark:bg-brand-900/20'
            )}
          >
            <Avatar src={other?.avatar} name={other?.name} online={isOnline} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-semibold">{other?.name}</span>
                {conv.lastMessage?.sentAt && <span className="shrink-0 text-[11px] text-gray-400">{formatRelativeTime(conv.lastMessage.sentAt)}</span>}
              </div>
              <div className="flex items-center justify-between">
                <p className="truncate text-xs text-gray-500">{conv.lastMessage?.text || 'Start the conversation'}</p>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.mobile && <p className="truncate text-[11px] text-gray-400">Re: {conv.mobile.brand} {conv.mobile.model}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ConversationList;
