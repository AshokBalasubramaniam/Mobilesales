import axiosClient from './axiosClient';
import type { ApiResponse, PaginationParams } from '../types/api';
import type { Conversation, Message, OfferStatus } from '../types/models';

export interface StartConversationPayload {
  recipientId: string;
  mobileId?: string;
  message?: string;
}

export interface RespondOfferPayload {
  status: OfferStatus;
  counterAmount?: number;
}

export interface LogCallEventPayload {
  event: string;
  durationSeconds?: number;
}

export const chatApi = {
  listConversations: (params?: PaginationParams) => axiosClient.get<ApiResponse<Conversation[]>>('/chat/conversations', { params }),
  startConversation: (payload: StartConversationPayload) => axiosClient.post<ApiResponse<Conversation>>('/chat/conversations', payload),
  blockConversation: (id: string) => axiosClient.patch<ApiResponse<Conversation>>(`/chat/conversations/${id}/block`),
  getConversation: (id: string) => axiosClient.get<ApiResponse<Conversation>>(`/chat/conversations/${id}`),
  getMessages: (id: string, params?: PaginationParams) =>
    axiosClient.get<ApiResponse<Message[]>>(`/chat/conversations/${id}/messages`, { params }),
  sendText: (id: string, content: string) =>
    axiosClient.post<ApiResponse<Message>>(`/chat/conversations/${id}/messages/text`, { content }),
  sendMedia: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post<ApiResponse<Message>>(`/chat/conversations/${id}/messages/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  sendOffer: (id: string, amount: number) => axiosClient.post<ApiResponse<Message>>(`/chat/conversations/${id}/messages/offer`, { amount }),
  respondOffer: (id: string, messageId: string, payload: RespondOfferPayload) =>
    axiosClient.patch<ApiResponse<Message>>(`/chat/conversations/${id}/messages/${messageId}/offer`, payload),
  sendLocation: (id: string, payload: { lat: number; lng: number }) =>
    axiosClient.post<ApiResponse<Message>>(`/chat/conversations/${id}/messages/location`, payload),
  logCallEvent: (id: string, payload: LogCallEventPayload) =>
    axiosClient.post<ApiResponse<Message>>(`/chat/conversations/${id}/call-events`, payload),

  // admin
  listAllConversations: (params?: PaginationParams) =>
    axiosClient.get<ApiResponse<Conversation[]>>('/chat/conversations/admin/all', { params }),
};
