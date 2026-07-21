import { apiClient } from '../../../lib/axios-client';

export interface AiChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  citations?: string[];
  requiresReview?: boolean;
  timestamp: string;
}

export interface AiPromptTemplate {
  id: string;
  title: string;
  category: 'CLINICAL' | 'ADMINISTRATIVE' | 'PATIENT_EDUCATION';
  promptText: string;
}

export const aiService = {
  async sendMessage(content: string, context?: any) {
    const response = await apiClient.post<AiChatMessage>('/ai/chat', { content, context });
    return response.data;
  },

  async getPrompts() {
    const response = await apiClient.get<AiPromptTemplate[]>('/ai/prompts');
    return response.data;
  },

  async sendFeedback(messageId: string, rating: 'THUMBS_UP' | 'THUMBS_DOWN', comments?: string) {
    const response = await apiClient.post('/ai/feedback', { messageId, rating, comments });
    return response.data;
  },
};
