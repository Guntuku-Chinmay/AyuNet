import { create } from 'zustand';
import { storage } from '../utils/storage';

export type WidgetId =
  | 'total-patients'
  | 'today-appointments'
  | 'doctors-on-duty'
  | 'revenue'
  | 'lab-orders'
  | 'recent-activity';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  visible: boolean;
}

interface DashboardState {
  widgets: WidgetConfig[];
  toggleWidget: (id: WidgetId) => void;
  resetLayout: () => void;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'total-patients', title: 'Total Patients', visible: true },
  { id: 'today-appointments', title: "Today's Appointments", visible: true },
  { id: 'doctors-on-duty', title: 'Doctors On Duty', visible: true },
  { id: 'revenue', title: 'Monthly Revenue', visible: true },
  { id: 'lab-orders', title: 'Clinical Lab Orders', visible: true },
  { id: 'recent-activity', title: 'Recent Activity Stream', visible: true },
];

export const useDashboardStore = create<DashboardState>((set) => ({
  widgets: storage.getItem<WidgetConfig[]>('ayunet_dashboard_widgets', DEFAULT_WIDGETS),

  toggleWidget: (id) =>
    set((state) => {
      const updated = state.widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
      storage.setItem('ayunet_dashboard_widgets', updated);
      return { widgets: updated };
    }),

  resetLayout: () => {
    storage.setItem('ayunet_dashboard_widgets', DEFAULT_WIDGETS);
    set({ widgets: DEFAULT_WIDGETS });
  },
}));
