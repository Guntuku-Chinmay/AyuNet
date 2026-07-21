import { create } from 'zustand';
import { QueueToken } from '../features/reception/services/reception-service';

interface QueueState {
  tokens: QueueToken[];
  selectedToken: QueueToken | null;
  addToken: (token: QueueToken) => void;
  updateTokenStatus: (id: string, status: QueueToken['status']) => void;
  setSelectedToken: (token: QueueToken | null) => void;
}

const INITIAL_TOKENS: QueueToken[] = [
  {
    id: 'tok-101',
    tokenNumber: 'A-012',
    patientName: 'Rahul Sharma',
    uhid: 'UHID-2026-9918',
    doctorName: 'Dr. Priya Mehta',
    departmentName: 'Cardiology',
    status: 'IN_CONSULTATION',
    isEmergency: false,
    checkInTime: '10:05 AM',
  },
  {
    id: 'tok-102',
    tokenNumber: 'A-013',
    patientName: 'Ananya Patel',
    uhid: 'UHID-2026-9919',
    doctorName: 'Dr. Priya Mehta',
    departmentName: 'Cardiology',
    status: 'WAITING',
    isEmergency: false,
    checkInTime: '10:12 AM',
  },
  {
    id: 'tok-103',
    tokenNumber: 'EM-004',
    patientName: 'Emergency Patient (Chest Pain)',
    uhid: 'UHID-EMG-0042',
    doctorName: 'Dr. Rajesh Kumar',
    departmentName: 'Emergency Medicine',
    status: 'WAITING',
    isEmergency: true,
    checkInTime: '10:20 AM',
  },
];

export const useQueueStore = create<QueueState>((set) => ({
  tokens: INITIAL_TOKENS,
  selectedToken: null,

  addToken: (token) =>
    set((state) => ({
      tokens: [token, ...state.tokens],
    })),

  updateTokenStatus: (id, status) =>
    set((state) => ({
      tokens: state.tokens.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  setSelectedToken: (token) => set({ selectedToken: token }),
}));
