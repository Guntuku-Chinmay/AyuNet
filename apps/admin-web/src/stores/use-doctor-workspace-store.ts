import { create } from 'zustand';

export type WorkspaceTab = 'OVERVIEW' | 'SOAP_NOTE' | 'PRESCRIPTION' | 'LAB_ORDER' | 'TIMELINE';

interface DoctorWorkspaceState {
  activePatientId: string | null;
  activeAppointmentId: string | null;
  activeTab: WorkspaceTab;
  setActivePatient: (patientId: string | null, appointmentId?: string | null) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
}

export const useDoctorWorkspaceStore = create<DoctorWorkspaceState>((set) => ({
  activePatientId: 'pat-9918',
  activeAppointmentId: 'apt-001',
  activeTab: 'OVERVIEW',

  setActivePatient: (patientId, appointmentId = null) =>
    set({ activePatientId: patientId, activeAppointmentId: appointmentId }),

  setActiveTab: (activeTab) => set({ activeTab }),
}));
