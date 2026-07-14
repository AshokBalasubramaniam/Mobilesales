import api from '../../api/api';
import type { AppDispatch } from '../../app/store';
import type { ApiResponse, PaginationParams } from '../../types/api';
import type { Conversation, Message } from '../../types/models';
import { conversationsRequest, conversationsSuccess, messagesFetched } from './slice';

export interface FetchMessagesArg {
  conversationId: string;
  params?: PaginationParams;
}

export const fetchConversations = (params?: PaginationParams) => async (dispatch: AppDispatch) => {
  dispatch(conversationsRequest());
  try {
    const { data } = await api.get<ApiResponse<Conversation[]>>('/chat/conversations', { params });
    dispatch(conversationsSuccess(data.data));
    return data.data;
  } catch {
    // conversationsStatus intentionally stays 'loading' on failure, matching prior behavior.
  }
};

export const fetchMessages = ({ conversationId, params }: FetchMessagesArg) => async (dispatch: AppDispatch) => {
  try {
    const { data } = await api.get<ApiResponse<Message[]>>(`/chat/conversations/${conversationId}/messages`, { params });
    dispatch(messagesFetched({ conversationId, messages: data.data }));
    return { conversationId, messages: data.data };
  } catch {
    // no-op on failure, matching prior behavior.
  }
};
