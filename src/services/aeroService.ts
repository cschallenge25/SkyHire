import api from './api';

export interface ChatPayload {
  question: string;
  language?: 'fr' | 'en';
  include_sources?: boolean;
  brief?: boolean;
}

export interface ChatResult {
  answer: string;
  sources: string[];
}

export const aeroService = {
  async chat(payload: ChatPayload): Promise<ChatResult> {
    const { data } = await api.post('/api/aero/chat', payload);
    return {
      answer: data?.answer || '',
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  },
};
