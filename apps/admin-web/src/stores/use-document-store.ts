import { create } from 'zustand';
import { DocumentItem } from '../features/documents/services/document-service';

interface DocumentState {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  viewMode: 'GRID' | 'LIST';
  selectedCategory: string;
  setSelectedDocument: (doc: DocumentItem | null) => void;
  setViewMode: (mode: 'GRID' | 'LIST') => void;
  setSelectedCategory: (cat: string) => void;
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-101',
    name: 'Discharge_Summary_Rahul_Sharma.pdf',
    fileType: 'PDF',
    size: '2.4 MB',
    category: 'Clinical EMR',
    uploadedBy: 'Dr. Priya Mehta',
    uploadedAt: '2026-07-21 10:45 AM',
    version: 'v1.2',
    confidentiality: 'CONFIDENTIAL',
  },
  {
    id: 'doc-102',
    name: 'Chest_XRay_PACS_Study_88192.dcm',
    fileType: 'DICOM',
    size: '45.1 MB',
    category: 'Radiology Imaging',
    uploadedBy: 'Apollo Imaging Center',
    uploadedAt: '2026-07-20 03:15 PM',
    version: 'v1.0',
    confidentiality: 'RESTRICTED',
  },
  {
    id: 'doc-103',
    name: 'Serum_Potassium_Pathology_Report.pdf',
    fileType: 'PDF',
    size: '1.1 MB',
    category: 'Pathology Lab',
    uploadedBy: 'Technician R. Verma',
    uploadedAt: '2026-07-21 11:15 AM',
    version: 'v1.0',
    confidentiality: 'CONFIDENTIAL',
  },
];

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: INITIAL_DOCUMENTS,
  selectedDocument: INITIAL_DOCUMENTS[0],
  viewMode: 'GRID',
  selectedCategory: 'ALL',

  setSelectedDocument: (selectedDocument) => set({ selectedDocument }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
