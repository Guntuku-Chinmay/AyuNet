import { apiClient } from '../../../lib/axios-client';
import { Prescription } from '@ayunet/types';

export interface PharmacyQueueItem {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  uhid: string;
  doctorName: string;
  medicationCount: number;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'DISPENSED' | 'REJECTED';
  isControlled: boolean;
  prescribedAt: string;
}

export interface InventoryBatch {
  batchNumber: string;
  expiryDate: string;
  availableQuantity: number;
  location: string;
}

export const pharmacyService = {
  async getQueue() {
    const response = await apiClient.get<PharmacyQueueItem[]>('/pharmacy/queue');
    return response.data;
  },

  async verifyPrescription(id: string, status: 'VERIFIED' | 'REJECTED', notes?: string) {
    const response = await apiClient.post<PharmacyQueueItem>(`/pharmacy/prescriptions/${id}/verify`, { status, notes });
    return response.data;
  },

  async dispenseMedications(data: { prescriptionId: string; batchAllocations: { batchNumber: string; quantity: number }[] }) {
    const response = await apiClient.post<{ message: string }>(`/pharmacy/dispense`, data);
    return response.data;
  },
};
