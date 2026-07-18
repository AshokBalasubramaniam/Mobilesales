import type { Dispatch } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { ApiResponse, PaginationParams } from "../../types/api";
import type { Conversation, Message } from "../../types/models";
import {
  conversationsStart,
  conversationsSuccess,
  messagesFetched,
} from "./slice";

export interface FetchMessagesArg {
  conversationId: string;
  params?: PaginationParams;
}

export const fetchConversations =
  (params?: PaginationParams) => async (dispatch: Dispatch) => {
    try {
      dispatch(conversationsStart());
      const response = await api.get<ApiResponse<Conversation[]>>(
        "/chat/conversations",
        { params },
      );
      if (response.status === 200) {
        dispatch(conversationsSuccess(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      throw error;
    }
  };

export const fetchMessages =
  ({ conversationId, params }: FetchMessagesArg) =>
  async (dispatch: Dispatch) => {
    try {
      const response = await api.get<ApiResponse<Message[]>>(
        `/chat/conversations/${conversationId}/messages`,
        { params },
      );
      if (response.status === 200) {
        dispatch(
          messagesFetched({ conversationId, messages: response.data.data }),
        );
        return { conversationId, messages: response.data.data };
      }
    } catch (error) {
      throw error;
    }
  };
