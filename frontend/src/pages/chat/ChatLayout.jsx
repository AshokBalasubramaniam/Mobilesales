import { Outlet, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { MessageCircle } from 'lucide-react';
import ConversationList from '../../components/chat/ConversationList';

const ChatLayout = () => {
  const { conversationId } = useParams();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className={clsx('w-full overflow-y-auto border-r border-gray-200 lg:block lg:w-80 dark:border-gray-800', conversationId && 'hidden')}>
          <ConversationList />
        </div>
        <div className={clsx('min-w-0 flex-1', !conversationId && 'hidden lg:block')}>
          {conversationId ? (
            <Outlet />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <MessageCircle className="size-10" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
