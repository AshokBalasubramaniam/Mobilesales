import type { RootState } from "../../app/store";

export const selectConversations = (state: RootState) =>
  state.chat.conversations;
export const selectConversationsStatus = (state: RootState) =>
  state.chat.conversationsStatus;
export const selectActiveConversationId = (state: RootState) =>
  state.chat.activeConversationId;
export const selectOnlineUserIds = (state: RootState) =>
  state.chat.onlineUserIds;
export const selectLastSeenByUserId = (state: RootState) =>
  state.chat.lastSeenByUserId;

export const selectMessagesForConversation =
  (conversationId: string | undefined) => (state: RootState) =>
    (conversationId && state.chat.messagesByConversation[conversationId]) || [];

export const selectTypingForConversation =
  (conversationId: string | undefined) => (state: RootState) =>
    (conversationId && state.chat.typingByConversation[conversationId]) || [];

export const selectChatUnreadTotal = (state: RootState) =>
  state.chat.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
