import { z } from 'zod';

export const integrationStatusSchema = z.enum(['active', 'inactive', 'failed', 'pending']);
export const integrationEnvironmentSchema = z.enum(['sandbox', 'production']);

export const integrationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string(),
  provider: z.string(),
  status: integrationStatusSchema,
  environment: integrationEnvironmentSchema,
  webhookEnabled: z.boolean(),
  apiCallsToday: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const webhookSchema = z.object({
  id: z.string(),
  event: z.string(),
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['POST', 'PUT', 'PATCH']),
  status: z.enum(['active', 'inactive', 'failed']),
  retryCount: z.number().min(0).max(5),
  lastTriggered: z.string().optional(),
  secret: z.string().optional(),
});

export const apiKeySchema = z.object({
  id: z.string(),
  service: z.string().min(1),
  environment: integrationEnvironmentSchema,
  status: integrationStatusSchema,
  keyMasked: z.string(),
  lastUsed: z.string(),
  createdAt: z.string(),
});

export type WebhookInput = z.infer<typeof webhookSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
