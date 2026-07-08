import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { chatApi } from '../../api/chat.api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatRelativeTime } from '../../utils/format';

const Chats = () => {
  const [conversations, setConversations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    chatApi
      .listAllConversations({ page })
      .then(({ data }) => {
        setConversations(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">All Conversations</h2>
      <p className="mb-4 text-sm text-gray-500">View any buyer/seller chat and reply directly for support or dispute mediation.</p>

      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c._id}
              to={`/admin/chats/${c._id}`}
              className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-brand-300 dark:border-gray-800"
            >
              <div className="flex shrink-0 -space-x-2">
                {c.participants.map((p) => (
                  <Avatar key={p._id} src={p.avatar} name={p.name} size="sm" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {c.participants.map((p) => `${p.name} (${p.role})`).join(' ↔ ')}
                </p>
                <p className="truncate text-xs text-gray-500">{c.lastMessage?.text || 'No messages yet'}</p>
                {c.mobile && (
                  <p className="truncate text-[11px] text-gray-400">
                    Re: {c.mobile.brand} {c.mobile.model}
                  </p>
                )}
              </div>
              {c.isBlocked && <Badge variant="red">Blocked</Badge>}
              <span className="shrink-0 text-xs text-gray-400">{formatRelativeTime(c.updatedAt)}</span>
            </Link>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Chats;
