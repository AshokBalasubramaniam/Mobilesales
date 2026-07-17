import { Outlet, useParams } from "react-router-dom";
import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import ConversationList from "../../components/chat/ConversationList";

const classes = {
  page: "mx-auto max-w-6xl px-4 py-6",
  panel:
    "flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-200",
  listWrapper:
    "w-full overflow-y-auto border-r border-gray-200 lg:block lg:w-80",
  listWrapperHidden: "hidden",
  content: "min-w-0 flex-1",
  contentHidden: "hidden lg:block",
  placeholder:
    "flex h-full flex-col items-center justify-center gap-2 text-gray-400",
  placeholderIcon: "size-10",
};

const ChatLayout = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  return (
    <div className={classes.page}>
      <div className={classes.panel}>
        <div
          className={clsx(
            classes.listWrapper,
            conversationId && classes.listWrapperHidden,
          )}
        >
          <ConversationList />
        </div>
        <div
          className={clsx(
            classes.content,
            !conversationId && classes.contentHidden,
          )}
        >
          {conversationId ? (
            <Outlet />
          ) : (
            <div className={classes.placeholder}>
              <MessageCircle className={classes.placeholderIcon} />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
