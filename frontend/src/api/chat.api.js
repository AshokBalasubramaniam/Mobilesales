import axiosClient from './axiosClient';

export const chatApi = {
  listConversations: (params) => axiosClient.get('/chat/conversations', { params }),
  startConversation: (payload) => axiosClient.post('/chat/conversations', payload),
  blockConversation: (id) => axiosClient.patch(`/chat/conversations/${id}/block`),
  getConversation: (id) => axiosClient.get(`/chat/conversations/${id}`),
  getMessages: (id, params) => axiosClient.get(`/chat/conversations/${id}/messages`, { params }),
  sendText: (id, content) => axiosClient.post(`/chat/conversations/${id}/messages/text`, { content }),
  sendMedia: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post(`/chat/conversations/${id}/messages/media`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  sendOffer: (id, amount) => axiosClient.post(`/chat/conversations/${id}/messages/offer`, { amount }),
  respondOffer: (id, messageId, payload) => axiosClient.patch(`/chat/conversations/${id}/messages/${messageId}/offer`, payload),
  sendLocation: (id, payload) => axiosClient.post(`/chat/conversations/${id}/messages/location`, payload),
  logCallEvent: (id, payload) => axiosClient.post(`/chat/conversations/${id}/call-events`, payload),

  // admin
  listAllConversations: (params) => axiosClient.get('/chat/conversations/admin/all', { params }),
};
