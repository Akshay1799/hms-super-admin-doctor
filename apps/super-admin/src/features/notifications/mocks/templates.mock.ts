import { Template } from '../types/notifications.types';

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tmpl-1', name: 'Appointment Reminder', channel: 'email', category: 'appointment',
    subject: 'Your appointment is tomorrow, {{name}}', body: 'Dear {{name}}, this is a reminder that you have an appointment at {{hospital}} on {{date}}.', variables: ['{{name}}', '{{hospital}}', '{{date}}'], status: 'active',
    createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-06-10T10:30:00Z',
  },
  {
    id: 'tmpl-2', name: 'Invoice Due Notice', channel: 'email', category: 'invoice',
    subject: 'Invoice {{invoiceNumber}} is due on {{date}}', body: 'Dear {{name}}, your invoice #{{invoiceNumber}} for {{amount}} is due on {{date}}. Please make payment to avoid late fees.', variables: ['{{name}}', '{{invoiceNumber}}', '{{amount}}', '{{date}}'], status: 'active',
    createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-06-15T11:00:00Z',
  },
  {
    id: 'tmpl-3', name: 'SMS Appointment Confirmation', channel: 'sms', category: 'appointment',
    body: 'Hi {{name}}, your appointment at {{hospital}} is confirmed for {{date}}. Reply CANCEL to cancel.', variables: ['{{name}}', '{{hospital}}', '{{date}}'], status: 'active',
    createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'tmpl-4', name: 'Password Reset OTP', channel: 'sms', category: 'password-reset',
    body: 'Your HMS password reset OTP is: {{otp}}. Valid for 10 minutes. Do not share this code.', variables: ['{{otp}}'], status: 'active',
    createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-05-20T09:00:00Z',
  },
  {
    id: 'tmpl-5', name: 'WhatsApp Welcome Message', channel: 'whatsapp', category: 'user-management',
    body: 'Welcome to HMS, {{name}}! 🏥 Your account has been created for {{hospital}}. Your temporary password is {{password}}. Please change it on first login.', variables: ['{{name}}', '{{hospital}}', '{{password}}'], status: 'active',
    createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-06-20T14:00:00Z',
  },
  {
    id: 'tmpl-6', name: 'Subscription Renewal Alert', channel: 'email', category: 'subscription',
    subject: 'Action Required: Your subscription renews on {{date}}', body: 'Dear {{name}}, your {{planName}} subscription for {{tenantName}} will auto-renew on {{date}} for {{amount}}.', variables: ['{{name}}', '{{planName}}', '{{tenantName}}', '{{date}}', '{{amount}}'], status: 'draft',
    createdAt: '2026-05-10T09:00:00Z', updatedAt: '2026-05-10T09:00:00Z',
  },
  {
    id: 'tmpl-7', name: 'In-App Security Alert', channel: 'in-app', category: 'security',
    body: '⚠️ Security Alert: Unusual login detected for {{user}} from IP {{ip}} at {{time}}.', variables: ['{{user}}', '{{ip}}', '{{time}}'], status: 'active',
    createdAt: '2026-06-01T09:00:00Z', updatedAt: '2026-06-21T11:00:00Z',
  },
];
