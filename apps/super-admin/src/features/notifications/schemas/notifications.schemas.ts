import { z } from 'zod';

export const notificationChannelSchema = z.enum(['email', 'sms', 'whatsapp', 'in-app']);
export const notificationPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const notificationStatusSchema = z.enum(['unread', 'read', 'archived']);
export const templateStatusSchema = z.enum(['active', 'inactive', 'draft']);
export const broadcastStatusSchema = z.enum(['draft', 'scheduled', 'sent', 'failed', 'cancelled']);
export const deliveryStatusSchema = z.enum(['pending', 'delivered', 'failed', 'read', 'retrying']);

export const templateCategorySchema = z.enum([
  'appointment', 'billing', 'invoice', 'claims',
  'user-management', 'security', 'password-reset',
  'subscription', 'broadcast', 'custom'
]);

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'success', 'warning', 'error', 'critical']),
  channel: notificationChannelSchema,
  priority: notificationPrioritySchema,
  status: notificationStatusSchema,
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Template name is required'),
  channel: notificationChannelSchema,
  category: templateCategorySchema,
  subject: z.string().optional(),
  body: z.string().min(1, 'Template body is required'),
  variables: z.array(z.string()),
  status: templateStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const broadcastSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  channel: notificationChannelSchema,
  audience: z.enum([
    'all-tenants', 'specific-tenant', 'hospitals',
    'doctors', 'staff', 'admins', 'custom-users'
  ]),
  message: z.string().min(1, 'Message is required'),
  status: broadcastStatusSchema,
  priority: notificationPrioritySchema,
  scheduledAt: z.string(),
  sentAt: z.string().optional(),
  recipientCount: z.number(),
});

export type TemplateInput = z.infer<typeof templateSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
