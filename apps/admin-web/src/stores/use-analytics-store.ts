import { create } from 'zustand';

export type DateRangePreset = 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

interface AnalyticsState {
  dateRange: DateRangePreset;
  selectedDataset: string;
  setDateRange: (dateRange: DateRangePreset) => void;
  setSelectedDataset: (selectedDataset: string) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dateRange: 'THIS_MONTH',
  selectedDataset: 'REVENUE',

  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedDataset: (selectedDataset) => set({ selectedDataset }),
}));
