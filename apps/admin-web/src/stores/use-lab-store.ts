import { create } from 'zustand';
import { LabWorklistItem } from '../features/lab/services/lab-service';

interface LabState {
  worklist: LabWorklistItem[];
  selectedItem: LabWorklistItem | null;
  updateStatus: (id: string, status: LabWorklistItem['status'], extra?: Partial<LabWorklistItem>) => void;
  setSelectedItem: (item: LabWorklistItem | null) => void;
}

const INITIAL_WORKLIST: LabWorklistItem[] = [
  {
    id: 'lab-101',
    sampleId: 'SMP-8819',
    barcode: 'BC-99182',
    patientName: 'Rahul Sharma',
    uhid: 'UHID-2026-9918',
    testName: 'Serum Electrolytes (Potassium K+)',
    specimenType: 'Blood (Serum)',
    status: 'AWAITING_VALIDATION',
    collectedAt: '10:15 AM',
    resultValue: '6.8 mmol/L',
    referenceRange: '3.5 - 5.0 mmol/L',
    isCritical: true,
  },
  {
    id: 'lab-102',
    sampleId: 'SMP-8820',
    barcode: 'BC-99183',
    patientName: 'Ananya Patel',
    uhid: 'UHID-2026-9919',
    testName: 'HbA1c Glycated Hemoglobin',
    specimenType: 'Blood (EDTA)',
    status: 'PROCESSING',
    collectedAt: '10:30 AM',
    resultValue: '6.8%',
    referenceRange: '< 5.7% Normal',
    isCritical: false,
  },
  {
    id: 'lab-103',
    sampleId: 'SMP-8821',
    barcode: 'BC-99184',
    patientName: 'Suresh Gupta',
    uhid: 'UHID-2026-9920',
    testName: 'Lipid Profile (Total Cholesterol)',
    specimenType: 'Serum',
    status: 'COLLECTED',
    collectedAt: '10:45 AM',
  },
];

export const useLabStore = create<LabState>((set) => ({
  worklist: INITIAL_WORKLIST,
  selectedItem: null,

  updateStatus: (id, status, extra = {}) =>
    set((state) => ({
      worklist: state.worklist.map((item) => (item.id === id ? { ...item, status, ...extra } : item)),
    })),

  setSelectedItem: (item) => set({ selectedItem: item }),
}));
