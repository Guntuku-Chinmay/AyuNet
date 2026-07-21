import { apiClient } from '../../../lib/axios-client';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  isBeta?: boolean;
}

export const flagService = {
  async getFlags() {
    const response = await apiClient.get<FeatureFlag[]>('/feature-flags');
    return response.data;
  },

  async toggleFlag(key: string, enabled: boolean) {
    const response = await apiClient.patch<FeatureFlag>(`/feature-flags/${key}`, { enabled });
    return response.data;
  },
};
