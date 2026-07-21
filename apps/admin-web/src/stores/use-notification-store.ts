import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'notif-1',
      title: 'Lab Report Ready',
      message: 'Lab report for Patient Rahul Sharma (MRN-99824) has been verified.',
      type: 'SUCCESS',
      read: false,
      createdAt: '10 mins ago',
    },
    {
      id: 'notif-2',
      title: 'Emergency Check-in',
      message: 'STAT priority triage patient admitted to Apollo West ER.',
      type: 'WARNING',
      read: false,
      createdAt: '25 mins ago',
    },
    {
      id: 'notif-3',
      title: 'Invoice Settled',
      message: 'Invoice #INV-2026-0849 settled via UPI payment.',
      type: 'INFO',
      read: true,
      createdAt: '1 hour ago',
    },
  ],
  unreadCount: 2,

  addNotification: (item) =>
    set((state) => {
      const newNotif: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}`,
        read: false,
        createdAt: 'Just now',
      };
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unreadCount = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
