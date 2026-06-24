import { z } from 'zod';

export const auditSeveritySchema = z.enum(['info', 'warning', 'error', 'critical']);
export const auditStatusSchema = z.enum(['success', 'failed', 'blocked']);

export const auditLogSchema = z.object({
  id: z.string(),
  module: z.string(),
  action: z.string(),
  entity: z.string(),
  user: z.string(),
  severity: auditSeveritySchema,
  status: auditStatusSchema,
  createdAt: z.string(),
});

export const securityEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  severity: auditSeveritySchema,
  user: z.string(),
  ipAddress: z.string(),
  createdAt: z.string(),
  status: auditStatusSchema,
});

export const dataAccessSchema = z.object({
  id: z.string(),
  module: z.string(),
  entity: z.string(),
  action: z.string(),
  user: z.string(),
  reason: z.string(),
  createdAt: z.string(),
});
