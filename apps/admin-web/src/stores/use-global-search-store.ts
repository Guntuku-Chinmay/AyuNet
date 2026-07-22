import { create } from 'zustand';
import { SearchResultEntity } from '../features/search/services/search-service';

interface GlobalSearchState {
  isCommandPaletteOpen: boolean;
  query: string;
  results: SearchResultEntity[];
  recentSearches: string[];
  setCommandPaletteOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setResults: (results: SearchResultEntity[]) => void;
  addRecentSearch: (search: string) => void;
}

const INITIAL_RESULTS: SearchResultEntity[] = [
  { id: 'pat-9918', type: 'PATIENT', title: 'Rahul Sharma', subtitle: 'UHID-2026-9918 | Male, 45y | Cardiology OPD', route: '/patient/records' },
  { id: 'apt-101', type: 'APPOINTMENT', title: 'OPD Consultation - Rahul Sharma', subtitle: 'Today 10:30 AM | Dr. Priya Mehta', route: '/doctor/appointments' },
  { id: 'rx-8819', type: 'PRESCRIPTION', title: 'Prescription #RX-2026-8819', subtitle: 'Telmisartan 40mg | Dispensed', route: '/pharmacy/dispensing' },
  { id: 'lab-101', type: 'LAB_REPORT', title: 'Serum Electrolytes (Potassium K+)', subtitle: 'Value: 6.8 mmol/L (STAT CRITICAL)', route: '/lab/validation' },
];

export const useGlobalSearchStore = create<GlobalSearchState>((set) => ({
  isCommandPaletteOpen: false,
  query: '',
  results: INITIAL_RESULTS,
  recentSearches: ['Rahul Sharma', 'Potassium 6.8', 'Cardiology OPD'],

  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  addRecentSearch: (search) =>
    set((state) => ({ recentSearches: [search, ...state.recentSearches.filter((s) => s !== search)].slice(0, 5) })),
}));
