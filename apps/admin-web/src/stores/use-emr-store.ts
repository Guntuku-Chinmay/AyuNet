import { create } from 'zustand';
import { SoapNoteDraft } from '../features/emr/services/emr-service';

interface EmrState {
  activeVisitId: string | null;
  draft: SoapNoteDraft;
  lastAutoSaved: string | null;
  isDirty: boolean;
  setActiveVisitId: (visitId: string) => void;
  updateDraft: (partial: Partial<SoapNoteDraft>) => void;
  markSaved: () => void;
}

const INITIAL_DRAFT: SoapNoteDraft = {
  subjective: 'Patient reports persistent mild chest tightness over past 3 days following physical exertion.',
  objective: 'General Appearance: Alert, no acute distress. Vitals: BP 128/84 mmHg, HR 74 bpm, SpO2 99%. Chest: S1 S2 normal, no murmurs.',
  assessment: 'Stage 2 Essential Hypertension (ICD-10 I10), Exertional Chest Tightness.',
  plan: '1. Continue Telmisartan 40mg daily.\n2. Order 12-lead ECG & Serum Electrolytes.\n3. Follow-up in 2 weeks.',
  vitals: {
    bpSystolic: 128,
    bpDiastolic: 84,
    heartRate: 74,
    temperature: 98.6,
    spO2: 99,
    weightKg: 72,
    heightCm: 175,
  },
  diagnoses: [{ code: 'I10', name: 'Essential (primary) hypertension', isPrimary: true }],
};

export const useEmrStore = create<EmrState>((set) => ({
  activeVisitId: 'visit-9918',
  draft: INITIAL_DRAFT,
  lastAutoSaved: new Date().toLocaleTimeString(),
  isDirty: false,

  setActiveVisitId: (activeVisitId) => set({ activeVisitId }),

  updateDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial },
      isDirty: true,
    })),

  markSaved: () =>
    set({
      lastAutoSaved: new Date().toLocaleTimeString(),
      isDirty: false,
    }),
}));
