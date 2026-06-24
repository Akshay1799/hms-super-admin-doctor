import { MOCK_NOTIFICATIONS, DoctorNotification } from "../mocks/notifications.mock";

let localNotifications = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  async getNotifications(): Promise<DoctorNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [...localNotifications];
  },

  async markRead(id: string): Promise<DoctorNotification[]> {
    localNotifications = localNotifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return [...localNotifications];
  },

  async markAllRead(): Promise<DoctorNotification[]> {
    localNotifications = localNotifications.map((n) => ({ ...n, isRead: true }));
    return [...localNotifications];
  },

  async clearNotifications(): Promise<DoctorNotification[]> {
    localNotifications = [];
    return [...localNotifications];
  },
};
