import { apiClient } from '../../../lib/axios-client';

export const aiService = {
  async chat(message: string, conversationId?: string, provider?: string) {
    const response = await apiClient.post('/ai/chat', { message, conversationId, provider });
    return response.data;
  },

  async summarize(text: string, type: 'EMR' | 'VISIT' | 'CONSULTATION' | 'DISCHARGE') {
    const response = await apiClient.post('/ai/summarize', { text, type });
    return response.data;
  },

  async generateClinicalNote(prompt: string, template: string) {
    const response = await apiClient.post('/ai/generate', { prompt, template });
    return response.data;
  },

  async searchKnowledge(query: string) {
    const response = await apiClient.post('/ai/search', { query });
    return response.data;
  },
};
