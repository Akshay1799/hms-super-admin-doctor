import { RevenueMetric, Invoice, Payment, Claim, Subscription, Refund, MonthlyRevenue } from '../types/billing.types';

export const MOCK_REVENUE_METRICS: RevenueMetric[] = [
  { id: 'm1', metric: 'Monthly Revenue', value: 1250000, currency: 'USD', trend: 'up', percentageChange: 12.5, updatedAt: new Date().toISOString() },
  { id: 'm2', metric: 'MRR', value: 450000, currency: 'USD', trend: 'up', percentageChange: 5.2, updatedAt: new Date().toISOString() },
  { id: 'm3', metric: 'ARR', value: 5400000, currency: 'USD', trend: 'up', percentageChange: 8.4, updatedAt: new Date().toISOString() },
  { id: 'm4', metric: 'Collections', value: 980000, currency: 'USD', trend: 'down', percentageChange: -2.1, updatedAt: new Date().toISOString() },
  { id: 'm5', metric: 'Outstanding Amount', value: 270000, currency: 'USD', trend: 'up', percentageChange: 15.0, updatedAt: new Date().toISOString() },
  { id: 'm6', metric: 'Refunds', value: 15000, currency: 'USD', trend: 'neutral', percentageChange: 0, updatedAt: new Date().toISOString() },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-1001', tenantId: 't1', tenantName: 'Apollo Group', hospitalId: 'h1', hospitalName: 'Apollo Main Hospital', patientId: 'p1', patientName: 'John Doe', amount: 1500, currency: 'USD', status: 'paid', issuedDate: '2026-06-01', dueDate: '2026-06-15', paidDate: '2026-06-10', items: [{ description: 'Consultation', quantity: 1, unitPrice: 200, total: 200 }, { description: 'MRI Scan', quantity: 1, unitPrice: 1300, total: 1300 }] },
  { id: 'INV-1002', tenantId: 't1', tenantName: 'Apollo Group', hospitalId: 'h1', hospitalName: 'Apollo Main Hospital', patientId: 'p2', patientName: 'Jane Smith', amount: 450, currency: 'USD', status: 'overdue', issuedDate: '2026-05-20', dueDate: '2026-06-05', items: [{ description: 'Blood Test', quantity: 1, unitPrice: 450, total: 450 }] },
  { id: 'INV-1003', tenantId: 't2', tenantName: 'Fortis Healthcare', hospitalId: 'h2', hospitalName: 'Fortis South', patientId: 'p3', patientName: 'Robert Brown', amount: 3200, currency: 'USD', status: 'unpaid', issuedDate: '2026-06-15', dueDate: '2026-06-30', items: [{ description: 'Surgery Prep', quantity: 1, unitPrice: 3200, total: 3200 }] },
  { id: 'INV-1004', tenantId: 't3', tenantName: 'Max Healthcare', hospitalId: 'h3', hospitalName: 'Max Super Speciality', patientId: 'p4', patientName: 'Alice Johnson', amount: 850, currency: 'USD', status: 'paid', issuedDate: '2026-06-10', dueDate: '2026-06-25', paidDate: '2026-06-12', items: [{ description: 'Physiotherapy', quantity: 5, unitPrice: 170, total: 850 }] },
  { id: 'INV-1005', tenantId: 't1', tenantName: 'Apollo Group', hospitalId: 'h1', hospitalName: 'Apollo Main Hospital', patientId: 'p5', patientName: 'Charlie Davis', amount: 120, currency: 'USD', status: 'cancelled', issuedDate: '2026-06-05', dueDate: '2026-06-20', items: [{ description: 'Routine Checkup', quantity: 1, unitPrice: 120, total: 120 }] },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'PAY-8001', invoiceId: 'INV-1001', tenantId: 't1', tenantName: 'Apollo Group', amount: 1500, currency: 'USD', method: 'credit_card', status: 'completed', paymentDate: '2026-06-10', referenceId: 'REF-8001-A' },
  { id: 'PAY-8002', invoiceId: 'INV-1004', tenantId: 't3', tenantName: 'Max Healthcare', amount: 850, currency: 'USD', method: 'insurance', status: 'completed', paymentDate: '2026-06-12', referenceId: 'REF-8002-B' },
  { id: 'PAY-8003', invoiceId: 'INV-1003', tenantId: 't2', tenantName: 'Fortis Healthcare', amount: 3200, currency: 'USD', method: 'bank_transfer', status: 'pending', paymentDate: '2026-06-22', referenceId: 'REF-8003-C' },
  { id: 'PAY-8004', invoiceId: 'INV-1006', tenantId: 't1', tenantName: 'Apollo Group', amount: 250, currency: 'USD', method: 'cash', status: 'failed', paymentDate: '2026-06-18' },
  { id: 'PAY-8005', invoiceId: 'INV-1007', tenantId: 't4', tenantName: 'Global Hospitals', amount: 500, currency: 'USD', method: 'credit_card', status: 'refunded', paymentDate: '2026-05-10', referenceId: 'REF-8005-E' },
];

export const MOCK_CLAIMS: Claim[] = [
  { id: 'CLM-5001', invoiceId: 'INV-1001', patientId: 'p1', patientName: 'John Doe', providerName: 'Apollo Main Hospital', insuranceCompany: 'BlueCross', policyNumber: 'POL-123456', amountClaimed: 1300, amountApproved: 1300, currency: 'USD', status: 'approved', submissionDate: '2026-06-02', processingDate: '2026-06-09' },
  { id: 'CLM-5002', invoiceId: 'INV-1004', patientId: 'p4', patientName: 'Alice Johnson', providerName: 'Max Super Speciality', insuranceCompany: 'Aetna', policyNumber: 'POL-654321', amountClaimed: 850, amountApproved: 800, currency: 'USD', status: 'approved', submissionDate: '2026-06-11', processingDate: '2026-06-12' },
  { id: 'CLM-5003', invoiceId: 'INV-1003', patientId: 'p3', patientName: 'Robert Brown', providerName: 'Fortis South', insuranceCompany: 'Cigna', policyNumber: 'POL-987654', amountClaimed: 3200, currency: 'USD', status: 'pending', submissionDate: '2026-06-16' },
  { id: 'CLM-5004', invoiceId: 'INV-1008', patientId: 'p6', patientName: 'Eve White', providerName: 'Global Hospitals', insuranceCompany: 'UnitedHealth', policyNumber: 'POL-111222', amountClaimed: 5000, amountApproved: 0, currency: 'USD', status: 'rejected', submissionDate: '2026-06-05', processingDate: '2026-06-15', denialReason: 'Out of network provider' },
  { id: 'CLM-5005', invoiceId: 'INV-1009', patientId: 'p7', patientName: 'Frank Green', providerName: 'Apollo West', insuranceCompany: 'Humana', policyNumber: 'POL-333444', amountClaimed: 750, currency: 'USD', status: 'submitted', submissionDate: '2026-06-22' },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 'SUB-2001', tenantId: 't1', tenantName: 'Apollo Group', planName: 'Enterprise', billingCycle: 'yearly', amount: 120000, currency: 'USD', status: 'active', startDate: '2026-01-01', endDate: '2026-12-31', nextBillingDate: '2027-01-01' },
  { id: 'SUB-2002', tenantId: 't2', tenantName: 'Fortis Healthcare', planName: 'Professional', billingCycle: 'monthly', amount: 5000, currency: 'USD', status: 'active', startDate: '2026-06-01', endDate: '2026-06-30', nextBillingDate: '2026-07-01' },
  { id: 'SUB-2003', tenantId: 't3', tenantName: 'Max Healthcare', planName: 'Enterprise', billingCycle: 'yearly', amount: 110000, currency: 'USD', status: 'past_due', startDate: '2025-06-15', endDate: '2026-06-14', nextBillingDate: '2026-06-15' },
  { id: 'SUB-2004', tenantId: 't4', tenantName: 'Global Hospitals', planName: 'Starter', billingCycle: 'monthly', amount: 1000, currency: 'USD', status: 'canceled', startDate: '2026-01-01', endDate: '2026-05-31', nextBillingDate: 'N/A' },
  { id: 'SUB-2005', tenantId: 't5', tenantName: 'CarePlus Clinics', planName: 'Professional', billingCycle: 'monthly', amount: 5000, currency: 'USD', status: 'trialing', startDate: '2026-06-20', endDate: '2026-07-04', nextBillingDate: '2026-07-05' },
];

export const MOCK_REFUNDS: Refund[] = [
  { id: 'REF-3001', paymentId: 'PAY-8005', invoiceId: 'INV-1007', tenantId: 't4', tenantName: 'Global Hospitals', amount: 500, currency: 'USD', reason: 'Patient overcharged', status: 'completed', requestDate: '2026-05-15', processedDate: '2026-05-18' },
  { id: 'REF-3002', paymentId: 'PAY-8008', invoiceId: 'INV-1010', tenantId: 't1', tenantName: 'Apollo Group', amount: 150, currency: 'USD', reason: 'Service not rendered', status: 'pending', requestDate: '2026-06-21' },
  { id: 'REF-3003', paymentId: 'PAY-8009', invoiceId: 'INV-1011', tenantId: 't2', tenantName: 'Fortis Healthcare', amount: 300, currency: 'USD', reason: 'Duplicate payment', status: 'failed', requestDate: '2026-06-10', processedDate: '2026-06-12' },
];

export const MOCK_REVENUE_CHART: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 950000, collections: 900000 },
  { month: 'Feb', revenue: 1050000, collections: 1000000 },
  { month: 'Mar', revenue: 1100000, collections: 1080000 },
  { month: 'Apr', revenue: 1150000, collections: 1100000 },
  { month: 'May', revenue: 1200000, collections: 1180000 },
  { month: 'Jun', revenue: 1250000, collections: 980000 },
];
