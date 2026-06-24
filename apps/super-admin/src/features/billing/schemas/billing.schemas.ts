import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['paid', 'unpaid', 'overdue', 'cancelled', 'draft']);
export const PaymentStatusSchema = z.enum(['completed', 'pending', 'failed', 'refunded']);
export const ClaimStatusSchema = z.enum(['approved', 'pending', 'rejected', 'submitted']);
export const SubscriptionStatusSchema = z.enum(['active', 'past_due', 'canceled', 'trialing']);
export const RefundStatusSchema = z.enum(['completed', 'pending', 'failed']);

export const RevenueMetricSchema = z.object({
  id: z.string(),
  metric: z.string(),
  value: z.number(),
  currency: z.string(),
  trend: z.enum(['up', 'down', 'neutral']),
  percentageChange: z.number(),
  updatedAt: z.string()
});

export const InvoiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  status: InvoiceStatusSchema,
  issuedDate: z.string(),
  dueDate: z.string(),
  paidDate: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number()
  }))
});

export const PaymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  amount: z.number(),
  currency: z.string(),
  method: z.enum(['credit_card', 'bank_transfer', 'cash', 'insurance', 'other']),
  status: PaymentStatusSchema,
  paymentDate: z.string(),
  referenceId: z.string().optional()
});

export const ClaimSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  providerName: z.string(),
  insuranceCompany: z.string(),
  policyNumber: z.string(),
  amountClaimed: z.number(),
  amountApproved: z.number().optional(),
  currency: z.string(),
  status: ClaimStatusSchema,
  submissionDate: z.string(),
  processingDate: z.string().optional(),
  denialReason: z.string().optional()
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  planName: z.string(),
  billingCycle: z.enum(['monthly', 'yearly']),
  amount: z.number(),
  currency: z.string(),
  status: SubscriptionStatusSchema,
  startDate: z.string(),
  endDate: z.string(),
  nextBillingDate: z.string()
});

export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  invoiceId: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  amount: z.number(),
  currency: z.string(),
  reason: z.string(),
  status: RefundStatusSchema,
  requestDate: z.string(),
  processedDate: z.string().optional()
});
