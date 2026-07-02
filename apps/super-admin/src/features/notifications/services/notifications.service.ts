import { MOCK_NOTIFICATIONS } from '../mocks/notifications.mock';
import { MOCK_TEMPLATES } from '../mocks/templates.mock';
import { MOCK_BROADCASTS } from '../mocks/broadcasts.mock';
import { MOCK_DELIVERY_LOGS, MOCK_NOTIFICATION_ANALYTICS, MOCK_CHANNEL_DISTRIBUTION, MOCK_DELIVERY_TREND } from '../mocks/analytics.mock';
import { Notification, Template, Broadcast, DeliveryLog, NotificationAnalytics, ChannelDistribution, DeliveryTrend } from '../types/notifications.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let storeNotifications = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  // Notifications
  async getNotifications(): Promise<Notification[]> {
    
    return [...storeNotifications];
  },
  async markRead(id: string): Promise<Notification[]> {
    
    storeNotifications = storeNotifications.map(n => n.id === id ? { ...n, isRead: true, status: 'read' as const } : n);
    return [...storeNotifications];
  },
  async markAllRead(): Promise<Notification[]> {
    
    storeNotifications = storeNotifications.map(n => ({ ...n, isRead: true, status: 'read' as const }));
    return [...storeNotifications];
  },
  async clearNotifications(): Promise<Notification[]> {
    
    storeNotifications = [];
    return [];
  },

  // Templates
  async getTemplates(): Promise<Template[]> {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_notification_templates");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_notification_templates", JSON.stringify(MOCK_TEMPLATES));
    }
    return MOCK_TEMPLATES;
  },
  async getTemplateById(id: string): Promise<Template> {
    let list = MOCK_TEMPLATES;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_notification_templates");
      if (saved) list = JSON.parse(saved);
    }
    const template = list.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    return template;
  },
  async saveTemplates(data: Template[]): Promise<Template[]> {
    await delay(100);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_notification_templates", JSON.stringify(data));
    }
    return data;
  },

  // Broadcasts
  async getBroadcasts(): Promise<Broadcast[]> {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_broadcasts");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_broadcasts", JSON.stringify(MOCK_BROADCASTS));
    }
    return MOCK_BROADCASTS;
  },
  async saveBroadcasts(data: Broadcast[]): Promise<Broadcast[]> {
    await delay(100);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_broadcasts", JSON.stringify(data));
    }
    return data;
  },

  // Delivery Logs
  async getDeliveryLogs(): Promise<DeliveryLog[]> {
    
    return MOCK_DELIVERY_LOGS;
  },

  // Analytics
  async getAnalytics(): Promise<NotificationAnalytics> {
    
    return MOCK_NOTIFICATION_ANALYTICS;
  },
  async getChannelDistribution(): Promise<ChannelDistribution[]> {
    
    return MOCK_CHANNEL_DISTRIBUTION;
  },
  async getDeliveryTrend(): Promise<DeliveryTrend[]> {
    
    return MOCK_DELIVERY_TREND;
  },
};
