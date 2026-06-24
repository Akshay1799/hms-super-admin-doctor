import {
  MOCK_REVENUE_METRICS,
  MOCK_INVOICES,
  MOCK_PAYMENTS,
  MOCK_CLAIMS,
  MOCK_SUBSCRIPTIONS,
  MOCK_REFUNDS,
  MOCK_REVENUE_CHART
} from '../mocks/billing.mocks';
import {
  RevenueMetric,
  Invoice,
  Payment,
  Claim,
  Subscription,
  Refund,
  MonthlyRevenue
} from '../types/billing.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const billingService = {
  getRevenueMetrics: async (): Promise<RevenueMetric[]> => {
    
    return MOCK_REVENUE_METRICS;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    
    return MOCK_INVOICES;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    
    const invoice = MOCK_INVOICES.find(inv => inv.id === id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  },

  getPayments: async (): Promise<Payment[]> => {
    
    return MOCK_PAYMENTS;
  },

  getClaims: async (): Promise<Claim[]> => {
    
    return MOCK_CLAIMS;
  },

  getSubscriptions: async (): Promise<Subscription[]> => {
    
    return MOCK_SUBSCRIPTIONS;
  },

  getRefunds: async (): Promise<Refund[]> => {
    
    return MOCK_REFUNDS;
  },

  getRevenueChartData: async (): Promise<MonthlyRevenue[]> => {
    
    return MOCK_REVENUE_CHART;
  }
};
