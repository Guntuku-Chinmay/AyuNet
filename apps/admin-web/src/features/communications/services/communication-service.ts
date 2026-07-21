import { apiClient } from '../../../lib/axios-client';

export interface CommunicationMessage {
  id: string;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP_PUSH';
  subject: string;
  content: string;
  status: 'QUEUED' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: string;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP_PUSH';
  bodyTemplate: string;
}

export const communicationService = {
  async getMessages() {
    const response = await apiClient.get<CommunicationMessage[]>('/communications/messages');
    return response.data;
  },

  async sendMessage(data: { recipient: string; channel: string; subject?: string; content: string }) {
    const response = await apiClient.post<CommunicationMessage>('/communications/send', data);
    return response.data;
  },

  async getTemplates() {
    const response = await apiClient.get<NotificationTemplate[]>('/communications/templates');
    return response.data;
  },
};
