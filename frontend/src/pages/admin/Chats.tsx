import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { formatRelativeTime } from "../../utils/format";
import type { Conversation } from "../../types/models";
import type { PaginationMeta } from "../../types/api";

const classes = {
  heading: "mb-1 text-lg font-semibold",
  subheading: "mb-4 text-sm text-gray-500",
  list: "space-y-2",
  conversationLink:
    "flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-brand-300",
  avatarStack: "flex shrink-0 -space-x-2",
  content: "min-w-0 flex-1",
  participants: "truncate text-sm font-semibold",
  lastMessage: "truncate text-xs text-gray-500",
  mobileRef: "truncate text-[11px] text-gray-400",
  updatedAt: "shrink-0 text-xs text-gray-400",
};

const Chats = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiResponse<Conversation[]>>("/chat/conversations/admin/all", {
        params: { page },
      })
      .then(({ data }) => {
        setConversations(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className={classes.heading}>All Conversations</h2>
      <p className={classes.subheading}>
        View any buyer/seller chat and reply directly for support or dispute
        mediation.
      </p>

      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" />
      ) : (
        <div className={classes.list}>
          {conversations.map((c) => (
            <Link
              key={c._id}
              to={`/admin/chats/${c._id}`}
              className={classes.conversationLink}
            >
              <div className={classes.avatarStack}>
                {Array.isArray(c.participants) &&
                  c.participants.map((p) =>
                    typeof p === "string" ? null : (
                      <Avatar
                        key={p._id}
                        src={p.avatar}
                        name={p.name}
                        size="sm"
                      />
                    ),
                  )}
              </div>
              <div className={classes.content}>
                <p className={classes.participants}>
                  {c.participants
                    .map((p) =>
                      typeof p === "string" ? p : `${p.name} (${p.role})`,
                    )
                    .join(" ↔ ")}
                </p>
                <p className={classes.lastMessage}>
                  {c.lastMessage?.text || "No messages yet"}
                </p>
                {c.mobile && (
                  <p className={classes.mobileRef}>
                    Re: {c.mobile.brand} {c.mobile.model}
                  </p>
                )}
              </div>
              {c.isBlocked && <Badge variant="red">Blocked</Badge>}
              <span className={classes.updatedAt}>
                {formatRelativeTime(c.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
};

export default Chats;
