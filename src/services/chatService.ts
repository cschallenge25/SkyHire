import api from './api';

export type ChatUser = {
  _id: string;
  name: string;
  avatar?: string | null;
  role?: 'candidate' | 'recruiter' | 'admin';
};

export type Conversation = {
  _id: string;
  type: 'direct' | 'group';
  title?: string;
  participants: Array<{
    userId: string;
    lastRead?: string;
    user?: ChatUser;
  }>;
  lastMessage?: {
    content: string;
    sender: ChatUser;
    timestamp: string;
    type: 'text' | 'image' | 'file' | 'system';
  } | null;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  sender: ChatUser;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: any[];
  createdAt: string;
  updatedAt?: string;
};

export const chatService = {
  async getConversations(params?: Partial<{ page: number; limit: number }>): Promise<{ conversations: Conversation[]; page: number; pages: number; total: number; }> {
    const { data } = await api.get('/api/chat/conversations', { params });
    const payload = data?.data || {};
    return {
      conversations: payload.conversations || [],
      page: payload.pagination?.page || 1,
      pages: payload.pagination?.pages || 1,
      total: payload.pagination?.total || 0,
    };
  },

  async getMessages(conversationId: string, params?: Partial<{ page: number; limit: number }>): Promise<{ messages: ChatMessage[]; page: number; pages: number; total: number; }> {
    const { data } = await api.get(`/api/chat/conversations/${conversationId}/messages`, { params });
    const payload = data?.data || {};
    return {
      messages: payload.messages || [],
      page: payload.pagination?.page || 1,
      pages: payload.pagination?.pages || 1,
      total: payload.pagination?.total || 0,
    };
  },

  async sendMessage(conversationId: string, payload: Partial<{ content: string; type: 'text' | 'image' | 'file'; attachments: any[]; replyTo?: string }>): Promise<ChatMessage> {
    const { data } = await api.post(`/api/chat/conversations/${conversationId}/messages`, payload);
    return data?.data?.message;
  },

  async startConversation(participantIds: string[], title?: string): Promise<Conversation> {
    const { data } = await api.post('/api/chat/conversations', { participantIds, title });
    return data?.data?.conversation;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.patch(`/api/chat/conversations/${conversationId}/read`);
  },
};
