import { z } from 'zod';

export const generalSettingsSchema = z.object({
  platformName: z.string().min(2),
  companyName: z.string().min(2),
  supportEmail: z.string().email(),
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
  maintenanceMode: z.boolean(),
});

export const securitySchema = z.object({
  passwordLength: z.number().min(8),
  requireUppercase: z.boolean(),
  requireSpecialChar: z.boolean(),
  passwordExpiryDays: z.number().min(0),
  sessionTimeout: z.number().min(5),
  maxLoginAttempts: z.number().min(1),
  mfaRequired: z.boolean(),
});

export const featureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
});

export const storageSchema = z.object({
  provider: z.enum(['s3', 'cloudinary', 'local']),
  bucketName: z.string(),
  retentionDays: z.number(),
  maxFileSizeMB: z.number().min(1).max(500),
  backupEnabled: z.boolean(),
});
