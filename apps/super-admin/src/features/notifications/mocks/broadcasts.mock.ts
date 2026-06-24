import { Broadcast } from '../types/notifications.types';

export const MOCK_BROADCASTS: Broadcast[] = [
  {
    id: 'bcast-1', title: 'Platform Maintenance Notice', description: 'Scheduled downtime notice for all tenants.',
    channel: 'email', audience: 'all-tenants', message: 'Dear Tenant Admin, HMS will undergo scheduled maintenance on June 28, 2026 from 02:00 to 04:00 UTC. Services may be intermittently unavailable.', status: 'sent', priority: 'high', scheduledAt: '2026-06-23T10:00:00Z', sentAt: '2026-06-23T10:00:01Z', recipientCount: 58,
  },
  {
    id: 'bcast-2', title: 'New Feature: AI Diagnostics', description: 'Announce new AI diagnostic tool rollout.',
    channel: 'email', audience: 'hospitals', message: 'We are excited to announce the rollout of AI-powered diagnostic assistance in your HMS portal. Access it from the Clinical Analytics dashboard.', status: 'scheduled', priority: 'medium', scheduledAt: '2026-06-25T09:00:00Z', recipientCount: 120,
  },
  {
    id: 'bcast-3', title: 'Billing Policy Update', description: 'Inform tenants of updated billing terms.',
    channel: 'sms', audience: 'all-tenants', message: 'HMS billing policy update effective July 1, 2026. Please log in to your admin portal to review and accept the new terms.', status: 'draft', priority: 'medium', scheduledAt: '2026-06-28T08:00:00Z', recipientCount: 0,
  },
  {
    id: 'bcast-4', title: 'Doctor Portal Downtime', description: 'Urgent message to all registered doctors.',
    channel: 'whatsapp', audience: 'doctors', message: '⚠️ The Doctor Portal will be under maintenance on June 24, 2026, from 00:00–02:00 UTC. Please reschedule urgent tasks accordingly.', status: 'sent', priority: 'critical', scheduledAt: '2026-06-22T16:00:00Z', sentAt: '2026-06-22T16:00:02Z', recipientCount: 312,
  },
  {
    id: 'bcast-5', title: 'Security Update Required', description: 'Prompt admins to update passwords.',
    channel: 'in-app', audience: 'admins', message: 'As part of our quarterly security audit, all Super Admin accounts are required to update their passwords before June 30, 2026.', status: 'sent', priority: 'high', scheduledAt: '2026-06-20T08:00:00Z', sentAt: '2026-06-20T08:00:00Z', recipientCount: 14,
  },
];
