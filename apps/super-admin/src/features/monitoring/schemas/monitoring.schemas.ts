import { z } from 'zod';

export const healthStatusSchema = z.enum(['healthy', 'warning', 'critical', 'offline']);
export const jobStatusSchema = z.enum(['waiting', 'active', 'completed', 'failed', 'delayed']);
export const errorSeveritySchema = z.enum(['info', 'warning', 'error', 'critical']);

export const healthSchema = z.object({
  id: z.string(),
  service: z.string(),
  status: healthStatusSchema,
  responseTime: z.number(),
  version: z.string(),
  lastChecked: z.string(),
  uptime: z.number(),
});

export const queueSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['emails', 'notifications', 'invoices', 'reports', 'claims']),
  waiting: z.number(),
  active: z.number(),
  completed: z.number(),
  failed: z.number(),
  delayed: z.number(),
  status: healthStatusSchema,
});

export const errorSchema = z.object({
  id: z.string(),
  service: z.string(),
  severity: errorSeveritySchema,
  message: z.string(),
  occurrences: z.number(),
  createdAt: z.string(),
  status: z.enum(['open', 'resolved', 'ignored']),
});
