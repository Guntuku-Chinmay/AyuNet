import { apiClient } from '../../../lib/axios-client';

export interface DocumentItem {
  id: string;
  name: string;
  fileType: 'PDF' | 'IMAGE' | 'DICOM' | 'DOCX';
  size: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  confidentiality: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
}

export interface DocumentVersion {
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  changeNotes: string;
}

export const documentService = {
  async getDocuments() {
    const response = await apiClient.get<DocumentItem[]>('/documents');
    return response.data;
  },

  async uploadDocument(formData: FormData) {
    const response = await apiClient.post<DocumentItem>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getPresignedPreviewUrl(id: string) {
    const response = await apiClient.get<{ url: string }>(`/documents/${id}/presigned-url`);
    return response.data;
  },

  async getVersions(id: string) {
    const response = await apiClient.get<DocumentVersion[]>(`/documents/${id}/versions`);
    return response.data;
  },
};
