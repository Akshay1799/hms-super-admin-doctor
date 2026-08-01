export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'draft' | 'partially_paid';
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
  invoiceNumber: string;
  invoiceType: 'OPD' | 'IPD' | 'Lab' | 'Pharmacy' | 'Package' | 'General';
  billingMode: 'Self-Pay' | 'Insurance' | 'Corporate';
  insuranceDetails?: {
    provider: string;
    claimId: string;
    approvedAmount: number;
    patientResponsibility: number;
  };
  amount: number;
  taxAmount?: number;
  taxBreakup?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  discountAmount?: number;
  discountReason?: string;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  items: Array<{
    itemCategory: 'Consultation' | 'Bed' | 'Operation' | 'Procedure' | 'Medicine' | 'Test' | 'Package' | 'Other';
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }>;
  paymentHistory?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'advance';
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'insurance' | 'upi' | 'wallet' | 'other';
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
