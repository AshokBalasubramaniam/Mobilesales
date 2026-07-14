import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message, OfferStatus } from '../../types/models';

export interface PresenceUpdatedPayload {
  userId: string;
  online: boolean;
  lastSeen?: string;
}

export interface TypingUpdatedPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface OfferStatusUpdatedPayload {
  messageId: string;
  status: OfferStatus;
}

export interface MessagesFetchedPayload {
  conversationId: string;
  messages: Message[];
}

export interface ChatState {
  conversations: Conversation[];
  conversationsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  activeConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  typingByConversation: Record<string, string[]>;
  onlineUserIds: string[];
  lastSeenByUserId: Record<string, string>;
}

const initialState: ChatState = {
  conversations: [],
  conversationsStatus: 'idle',
  activeConversationId: null,
  messagesByConversation: {},
  typingByConversation: {},
  onlineUserIds: [],
  lastSeenByUserId: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      const conv = state.conversations.find((c) => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
    },
    messageAppended: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const list = state.messagesByConversation[message.conversation] || [];
      if (!list.some((m) => m._id === message._id)) {
        state.messagesByConversation[message.conversation] = [...list, message];
      }

      const conv = state.conversations.find((c) => c._id === message.conversation);
      if (conv) {
        conv.lastMessage = { text: message.content || `[${message.type}]`, type: message.type, sentAt: message.createdAt };
        if (state.activeConversationId !== message.conversation) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
    },
    presenceUpdated: (state, action: PayloadAction<PresenceUpdatedPayload>) => {
      const { userId, online, lastSeen } = action.payload;
      state.onlineUserIds = online ? [...new Set([...state.onlineUserIds, userId])] : state.onlineUserIds.filter((id) => id !== userId);
      if (!online && lastSeen) state.lastSeenByUserId[userId] = lastSeen;
    },
    presenceSnapshot: (state, action: PayloadAction<string[]>) => {
      state.onlineUserIds = action.payload;
    },
    typingUpdated: (state, action: PayloadAction<TypingUpdatedPayload>) => {
      const { conversationId, userId, isTyping } = action.payload;
      const current = state.typingByConversation[conversationId] || [];
      state.typingByConversation[conversationId] = isTyping ? [...new Set([...current, userId])] : current.filter((id) => id !== userId);
    },
    offerStatusUpdated: (state, action: PayloadAction<OfferStatusUpdatedPayload>) => {
      const { messageId, status } = action.payload;
      Object.values(state.messagesByConversation).forEach((list) => {
        const msg = list.find((m) => m._id === messageId);
        if (msg?.offer) msg.offer.status = status;
      });
    },

    conversationsRequest: (state) => {
      state.conversationsStatus = 'loading';
    },
    conversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.conversationsStatus = 'succeeded';
    },
    messagesFetched: (state, action: PayloadAction<MessagesFetchedPayload>) => {
      state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
    },
  },
});

export const {
  setActiveConversation,
  messageAppended,
  presenceUpdated,
  presenceSnapshot,
  typingUpdated,
  offerStatusUpdated,
  conversationsRequest,
  conversationsSuccess,
  messagesFetched,
} = chatSlice.actions;
export default chatSlice.reducer;
