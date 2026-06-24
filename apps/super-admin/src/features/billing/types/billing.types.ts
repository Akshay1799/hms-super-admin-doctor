export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'draft';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type ClaimStatus = 'approved' | 'pending' | 'rejected' | 'submitted';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type RefundStatus = 'completed' | 'pending' | 'failed';

export interface RevenueMetric {
  id: string;
  metric: string;
  value: number;
  currency: string;
  trend: 'up' | 'down' | 'neutral';
  percentageChange: number;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  hospitalId?: string;
  hospitalName?: string;
  patientId?: string;
  patientName?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface Payment {
  id: string;
  invoiceId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'insurance' | 'other';
  status: PaymentStatus;
  paymentDate: string;
  referenceId?: string;
}

export interface Claim {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  providerName: string;
  insuranceCompany: string;
  policyNumber: string;
  amountClaimed: number;
  amountApproved?: number;
  currency: string;
  status: ClaimStatus;
  submissionDate: string;
  processingDate?: string;
  denialReason?: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  invoiceId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  requestDate: string;
  processedDate?: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  collections: number;
}
