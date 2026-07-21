import { apiClient } from '../../../lib/axios-client';

export interface BrandingConfig {
  organizationName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  emailHeaderHtml: string;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'FHIR' | 'HL7' | 'SMS' | 'WHATSAPP' | 'PAYMENT';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastPing: string;
}

export const settingsService = {
  async getBranding() {
    const response = await apiClient.get<BrandingConfig>('/settings/branding');
    return response.data;
  },

  async updateBranding(data: Partial<BrandingConfig>) {
    const response = await apiClient.put<BrandingConfig>('/settings/branding', data);
    return response.data;
  },

  async getIntegrations() {
    const response = await apiClient.get<IntegrationConnector[]>('/settings/integrations');
    return response.data;
  },
};
