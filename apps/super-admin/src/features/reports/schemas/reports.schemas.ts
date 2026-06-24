import { z } from 'zod';

export const reportCategorySchema = z.enum(["financial", "operational", "clinical", "user_management", "compliance", "audit", "custom"]);
export const reportFrequencySchema = z.enum(["daily", "weekly", "monthly", "quarterly"]);
export const exportFormatSchema = z.enum(["pdf", "excel", "csv"]);

export const reportSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: reportCategorySchema,
  type: z.string(),
  createdAt: z.string(),
});

export const scheduledReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: reportFrequencySchema,
  status: z.string(),
  nextRun: z.string(),
  recipients: z.array(z.string()),
});

export const exportHistorySchema = z.object({
  id: z.string(),
  reportName: z.string(),
  format: exportFormatSchema,
  status: z.string(),
  requestedBy: z.string(),
  createdAt: z.string(),
});
