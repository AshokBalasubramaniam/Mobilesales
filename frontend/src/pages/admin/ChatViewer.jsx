import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { chatApi } from '../../api/chat.api';
import MessageBubble from '../../components/chat/MessageBubble';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';

const ChatViewer = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () =>
    Promise.all([chatApi.getConversation(conversationId), chatApi.getMessages(conversationId, { limit: 100 })]).then(
      ([convRes, msgRes]) => {
        setConversation(convRes.data.data);
        setMessages(msgRes.data.data);
      }
    );

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await chatApi.sendText(conversationId, text.trim());
      setText('');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner full />;
  if (!conversation) return null;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 border-b border-gray-200 p-3 dark:border-gray-800">
        <button onClick={() => navigate('/admin/chats')} className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex -space-x-2">
          {conversation.participants.map((p) => (
            <Avatar key={p._id} src={p.avatar} name={p.name} size="sm" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {conversation.participants.map((p) => `${p.name} (${p.role})`).join(' ↔ ')}
          </p>
          {conversation.mobile && (
            <p className="truncate text-xs text-gray-400">
              Re: {conversation.mobile.brand} {conversation.mobile.model}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const senderId = message.sender?._id || message.sender;
          const isOwn = senderId === user._id;
          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              senderLabel={!isOwn ? message.sender?.name : null}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply as Mobile Sales Support..."
          className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
        />
        <button type="submit" disabled={sending || !text.trim()} className="rounded-full bg-brand-600 p-2.5 text-white disabled:opacity-50">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatViewer;
