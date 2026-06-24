import { Notification } from '../types/notifications.types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', title: 'New Client Onboarding', message: 'Tenant Apollo Mumbai successfully completed verification.', type: 'success', channel: 'in-app', priority: 'medium', status: 'unread', isRead: false, createdAt: '2026-06-23T06:00:00Z' },
  { id: 'notif-2', title: 'Billing Invoice Overdue', message: 'City Clinic 1 has an unpaid growth plan invoice of $450.', type: 'warning', channel: 'in-app', priority: 'high', status: 'unread', isRead: false, createdAt: '2026-06-23T05:00:00Z' },
  { id: 'notif-3', title: 'Node Connection Interrupted', message: 'East Branch database sync failed (Code: DB_ERR).', type: 'error', channel: 'in-app', priority: 'critical', status: 'read', isRead: true, createdAt: '2026-06-23T02:00:00Z' },
  { id: 'notif-4', title: 'Security Rate-Limiting Active', message: 'DDoS rate-limit triggered on tenant interface.', type: 'critical', channel: 'in-app', priority: 'critical', status: 'unread', isRead: false, createdAt: '2026-06-22T06:00:00Z' },
  { id: 'notif-5', title: 'Doctor Registration Approved', message: 'Dr. Emily Chen has been approved for Apollo Hospital.', type: 'info', channel: 'email', priority: 'low', status: 'read', isRead: true, createdAt: '2026-06-22T10:00:00Z' },
  { id: 'notif-6', title: 'New Tenant Subscription', message: 'CarePlus Clinics subscribed to Professional Plan.', type: 'success', channel: 'email', priority: 'medium', status: 'archived', isRead: true, createdAt: '2026-06-21T08:00:00Z' },
];
