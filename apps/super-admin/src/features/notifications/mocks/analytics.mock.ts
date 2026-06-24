import { DeliveryLog, NotificationAnalytics, ChannelDistribution, DeliveryTrend } from '../types/notifications.types';

export const MOCK_DELIVERY_LOGS: DeliveryLog[] = [
  { id: 'dl-001', notificationId: 'bcast-1', recipient: 'Apollo Group Admin', recipientEmail: 'admin@apollo.com', channel: 'email', status: 'read', deliveredAt: '2026-06-23T10:01:00Z', readAt: '2026-06-23T10:15:00Z', retries: 0 },
  { id: 'dl-002', notificationId: 'bcast-1', recipient: 'Fortis Healthcare Admin', recipientEmail: 'admin@fortis.com', channel: 'email', status: 'delivered', deliveredAt: '2026-06-23T10:01:05Z', retries: 0 },
  { id: 'dl-003', notificationId: 'bcast-1', recipient: 'Max Healthcare Admin', recipientEmail: 'admin@max.com', channel: 'email', status: 'failed', retries: 3, errorMessage: 'SMTP delivery failed: Connection refused' },
  { id: 'dl-004', notificationId: 'bcast-4', recipient: 'Dr. Gregory House', recipientEmail: 'g.house@apollo.com', channel: 'whatsapp', status: 'delivered', deliveredAt: '2026-06-22T16:01:00Z', retries: 0 },
  { id: 'dl-005', notificationId: 'bcast-4', recipient: 'Dr. Meredith Grey', recipientEmail: 'm.grey@hospital.com', channel: 'whatsapp', status: 'read', deliveredAt: '2026-06-22T16:01:30Z', readAt: '2026-06-22T16:10:00Z', retries: 0 },
  { id: 'dl-006', notificationId: 'bcast-5', recipient: 'Super Admin', recipientEmail: 'superadmin@hms.com', channel: 'in-app', status: 'read', deliveredAt: '2026-06-20T08:00:01Z', readAt: '2026-06-20T08:05:00Z', retries: 0 },
  { id: 'dl-007', notificationId: 'bcast-4', recipient: 'Dr. Stephen Strange', recipientEmail: 's.strange@apollo.com', channel: 'whatsapp', status: 'retrying', retries: 2, errorMessage: 'WhatsApp number invalid' },
  { id: 'dl-008', notificationId: 'bcast-1', recipient: 'Global Hospitals Admin', recipientEmail: 'admin@global.com', channel: 'email', status: 'pending', retries: 0 },
];

export const MOCK_NOTIFICATION_ANALYTICS: NotificationAnalytics = {
  totalSent: 504,
  delivered: 471,
  failed: 33,
  readRate: 78.5,
  openRate: 64.2,
  ctr: 12.8,
};

export const MOCK_CHANNEL_DISTRIBUTION: ChannelDistribution[] = [
  { channel: 'Email', sent: 280, delivered: 260, failed: 20 },
  { channel: 'SMS', sent: 90, delivered: 88, failed: 2 },
  { channel: 'WhatsApp', sent: 84, delivered: 76, failed: 8 },
  { channel: 'In-App', sent: 50, delivered: 47, failed: 3 },
];

export const MOCK_DELIVERY_TREND: DeliveryTrend[] = [
  { date: 'Jun 17', sent: 45, delivered: 42, failed: 3 },
  { date: 'Jun 18', sent: 68, delivered: 65, failed: 3 },
  { date: 'Jun 19', sent: 52, delivered: 49, failed: 3 },
  { date: 'Jun 20', sent: 91, delivered: 86, failed: 5 },
  { date: 'Jun 21', sent: 78, delivered: 75, failed: 3 },
  { date: 'Jun 22', sent: 115, delivered: 109, failed: 6 },
  { date: 'Jun 23', sent: 55, delivered: 45, failed: 10 },
];
