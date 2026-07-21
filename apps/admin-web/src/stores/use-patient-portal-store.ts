import { create } from 'zustand';
import { FamilyMember, CaregiverProxy } from '../features/patient/services/patient-portal-service';

interface PatientPortalState {
  activeMember: FamilyMember;
  familyMembers: FamilyMember[];
  caregivers: CaregiverProxy[];
  setActiveMember: (member: FamilyMember) => void;
  setCaregivers: (caregivers: CaregiverProxy[]) => void;
}

const INITIAL_MEMBER: FamilyMember = {
  id: 'pat-9918',
  name: 'Rahul Sharma',
  relationship: 'SELF',
  uhid: 'UHID-2026-9918',
};

const FAMILY_MEMBERS: FamilyMember[] = [
  INITIAL_MEMBER,
  { id: 'pat-9918-sp', name: 'Priya Sharma', relationship: 'SPOUSE', uhid: 'UHID-2026-9921' },
  { id: 'pat-9918-ch', name: 'Aarav Sharma', relationship: 'CHILD', uhid: 'UHID-2026-9922' },
];

const INITIAL_CAREGIVERS: CaregiverProxy[] = [
  {
    id: 'cg-101',
    caregiverName: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    relationship: 'Spouse',
    permissions: ['VIEW_RECORDS', 'BOOK_APPOINTMENTS', 'PAY_BILLS'],
    status: 'ACTIVE',
  },
];

export const usePatientPortalStore = create<PatientPortalState>((set) => ({
  activeMember: INITIAL_MEMBER,
  familyMembers: FAMILY_MEMBERS,
  caregivers: INITIAL_CAREGIVERS,

  setActiveMember: (activeMember) => set({ activeMember }),
  setCaregivers: (caregivers) => set({ caregivers }),
}));
