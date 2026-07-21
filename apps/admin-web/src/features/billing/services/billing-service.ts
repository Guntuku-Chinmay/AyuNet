import { apiClient } from '../../../lib/axios-client';
import { Invoice, PaginatedResponse } from '@ayunet/types';

export const billingService = {
  async getInvoices(params?: { page?: number; limit?: number; status?: string }) {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return response.data;
  },

  async createInvoice(data: Partial<Invoice>) {
    const response = await apiClient.post<Invoice>('/invoices', data);
    return response.data;
  },

  async recordPayment(invoiceId: string, paymentData: { amount: number; paymentMethod: string }) {
    const response = await apiClient.post(`/invoices/${invoiceId}/payments`, paymentData);
    return response.data;
  },
};
