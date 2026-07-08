import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chat.api';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (params, { rejectWithValue }) => {
  try {
    const { data } = await chatApi.listConversations(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const startConversation = createAsyncThunk('chat/startConversation', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await chatApi.startConversation(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not start conversation');
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async ({ conversationId, params }, { rejectWithValue }) => {
  try {
    const { data } = await chatApi.getMessages(conversationId, params);
    return { conversationId, messages: data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    conversationsStatus: 'idle',
    activeConversationId: null,
    messagesByConversation: {},
    typingByConversation: {},
    onlineUserIds: [],
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
      const conv = state.conversations.find((c) => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
    },
    messageAppended: (state, action) => {
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
    presenceUpdated: (state, action) => {
      const { userId, online } = action.payload;
      state.onlineUserIds = online
        ? [...new Set([...state.onlineUserIds, userId])]
        : state.onlineUserIds.filter((id) => id !== userId);
    },
    typingUpdated: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      const current = state.typingByConversation[conversationId] || [];
      state.typingByConversation[conversationId] = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
    },
    offerStatusUpdated: (state, action) => {
      const { messageId, status } = action.payload;
      Object.values(state.messagesByConversation).forEach((list) => {
        const msg = list.find((m) => m._id === messageId);
        if (msg) msg.offer.status = status;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = 'loading';
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.conversationsStatus = 'succeeded';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some((c) => c._id === action.payload._id);
        if (!exists) state.conversations.unshift(action.payload);
      });
  },
});

export const { setActiveConversation, messageAppended, presenceUpdated, typingUpdated, offerStatusUpdated } = chatSlice.actions;
export default chatSlice.reducer;
