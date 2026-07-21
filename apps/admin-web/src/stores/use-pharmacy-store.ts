import { create } from 'zustand';
import { PharmacyQueueItem } from '../features/pharmacy/services/pharmacy-service';

interface PharmacyState {
  queue: PharmacyQueueItem[];
  selectedItem: PharmacyQueueItem | null;
  updateStatus: (id: string, status: PharmacyQueueItem['status']) => void;
  setSelectedItem: (item: PharmacyQueueItem | null) => void;
}

const INITIAL_QUEUE: PharmacyQueueItem[] = [
  {
    id: 'rx-9918',
    prescriptionNumber: 'RX-2026-8819',
    patientName: 'Rahul Sharma',
    uhid: 'UHID-2026-9918',
    doctorName: 'Dr. Priya Mehta',
    medicationCount: 2,
    status: 'PENDING_VERIFICATION',
    isControlled: false,
    prescribedAt: '10:30 AM',
  },
  {
    id: 'rx-9919',
    prescriptionNumber: 'RX-2026-8820',
    patientName: 'Ananya Patel',
    uhid: 'UHID-2026-9919',
    doctorName: 'Dr. Rajesh Kumar',
    medicationCount: 1,
    status: 'VERIFIED',
    isControlled: true,
    prescribedAt: '10:45 AM',
  },
];

export const usePharmacyStore = create<PharmacyState>((set) => ({
  queue: INITIAL_QUEUE,
  selectedItem: null,

  updateStatus: (id, status) =>
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? { ...item, status } : item)),
    })),

  setSelectedItem: (item) => set({ selectedItem: item }),
}));
