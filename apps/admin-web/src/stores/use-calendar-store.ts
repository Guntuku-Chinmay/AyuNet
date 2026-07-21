import { create } from 'zustand';

export type CalendarViewMode = 'DAY' | 'WEEK' | 'MONTH' | 'TIMELINE';

interface CalendarState {
  viewMode: CalendarViewMode;
  selectedDate: string;
  filterDoctorId: string | null;
  filterDepartmentId: string | null;
  setViewMode: (mode: CalendarViewMode) => void;
  setSelectedDate: (date: string) => void;
  setFilterDoctorId: (doctorId: string | null) => void;
  setFilterDepartmentId: (departmentId: string | null) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useCalendarStore = create<CalendarState>((set) => ({
  viewMode: 'WEEK',
  selectedDate: getTodayString(),
  filterDoctorId: null,
  filterDepartmentId: null,

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setFilterDoctorId: (filterDoctorId) => set({ filterDoctorId }),
  setFilterDepartmentId: (filterDepartmentId) => set({ filterDepartmentId }),
}));
