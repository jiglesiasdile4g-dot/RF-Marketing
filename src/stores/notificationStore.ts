import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (n) => {
        const current = get().notifications;
        const updated = [n, ...current].slice(0, 50);
        set({
          notifications: updated,
          unreadCount: updated.filter((x) => !x.read).length,
        });
      },
      markAsRead: (id) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        set({
          notifications: updated,
          unreadCount: updated.filter((x) => !x.read).length,
        });
      },
      markAllRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, read: true }));
        set({ notifications: updated, unreadCount: 0 });
      },
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'rf-notifications' }
  )
);
