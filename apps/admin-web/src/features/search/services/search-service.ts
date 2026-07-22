import { apiClient } from '../../../lib/axios-client';

export interface SearchResultEntity {
  id: string;
  type: 'PATIENT' | 'DOCTOR' | 'APPOINTMENT' | 'EMR' | 'PRESCRIPTION' | 'LAB_REPORT' | 'INVOICE';
  title: string;
  subtitle: string;
  route: string;
  status?: string;
}

export interface AiSearchAnswer {
  query: string;
  summary: string;
  relatedEntities: SearchResultEntity[];
}

export const searchService = {
  async searchGlobal(query: string) {
    const response = await apiClient.get<SearchResultEntity[]>(`/search/global?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getAiSearchAnswer(query: string) {
    const response = await apiClient.get<AiSearchAnswer>(`/search/ai-answer?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
