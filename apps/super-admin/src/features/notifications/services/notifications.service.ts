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
    
    return MOCK_TEMPLATES;
  },
  async getTemplateById(id: string): Promise<Template> {
    
    const template = MOCK_TEMPLATES.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    return template;
  },

  // Broadcasts
  async getBroadcasts(): Promise<Broadcast[]> {
    
    return MOCK_BROADCASTS;
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
