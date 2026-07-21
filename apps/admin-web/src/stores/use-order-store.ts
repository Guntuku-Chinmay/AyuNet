import { create } from 'zustand';
import {
  PrescribedMedicationItem,
  LabOrderRequestItem,
  ImagingOrderRequestItem,
} from '../features/orders/services/order-service';

interface OrderState {
  medications: PrescribedMedicationItem[];
  labOrders: LabOrderRequestItem[];
  imagingOrders: ImagingOrderRequestItem[];
  followUpDate: string | null;
  isSigned: boolean;
  addMedication: (item: PrescribedMedicationItem) => void;
  removeMedication: (id: string) => void;
  addLabOrder: (item: LabOrderRequestItem) => void;
  removeLabOrder: (code: string) => void;
  addImagingOrder: (item: ImagingOrderRequestItem) => void;
  setFollowUpDate: (date: string | null) => void;
  markSigned: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  medications: [
    {
      id: 'med-1',
      name: 'Telmisartan',
      strength: '40 mg',
      dosage: '1 Tablet',
      frequency: '1-0-0',
      route: 'Oral',
      durationDays: 30,
      foodTiming: 'After Food',
    },
    {
      id: 'med-2',
      name: 'Metformin HCl',
      strength: '500 mg',
      dosage: '1 Tablet',
      frequency: '1-0-1',
      route: 'Oral',
      durationDays: 30,
      foodTiming: 'With Meals',
    },
  ],
  labOrders: [
    { testCode: 'L-101', testName: 'Lipid Profile Panel', urgency: 'ROUTINE' },
    { testCode: 'L-102', testName: 'Serum Electrolytes (K+, Na+)', urgency: 'ROUTINE' },
  ],
  imagingOrders: [{ modality: 'ECG', bodyPart: 'Chest / Cardiac 12-Lead', clinicalHistory: 'Exertional chest tightness' }],
  followUpDate: '2026-08-04',
  isSigned: false,

  addMedication: (item) => set((state) => ({ medications: [...state.medications, item] })),
  removeMedication: (id) => set((state) => ({ medications: state.medications.filter((m) => m.id !== id) })),
  addLabOrder: (item) => set((state) => ({ labOrders: [...state.labOrders, item] })),
  removeLabOrder: (testCode) => set((state) => ({ labOrders: state.labOrders.filter((l) => l.testCode !== testCode) })),
  addImagingOrder: (item) => set((state) => ({ imagingOrders: [...state.imagingOrders, item] })),
  setFollowUpDate: (followUpDate) => set({ followUpDate }),
  markSigned: () => set({ isSigned: true }),
}));
