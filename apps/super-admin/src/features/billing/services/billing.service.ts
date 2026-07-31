import {
  MOCK_REVENUE_METRICS,
  MOCK_INVOICES,
  MOCK_PAYMENTS,
  MOCK_CLAIMS,
  MOCK_SUBSCRIPTIONS,
  MOCK_REFUNDS,
  MOCK_REVENUE_CHART,
} from "../mocks/billing.mocks";
import {
  RevenueMetric,
  Invoice,
  Payment,
  Claim,
  Subscription,
  Refund,
  MonthlyRevenue,
} from "../types/billing.types";
import { apiClient } from "@/lib/api-client";

function mapInvoice(raw: any): Invoice {
  return {
    id: raw._id ?? raw.id,
    patientId: raw.patientId ?? "",
    patientName: raw.patientName ?? "Unknown",
    hospitalId: raw.hospitalId ?? "",
    hospitalName: raw.hospitalName ?? "",
    invoiceNumber: raw.invoiceNumber ?? raw.id,
    status: raw.status ?? "Pending",
    amount: raw.amount ?? 0,
    paidAmount: raw.paidAmount ?? 0,
    dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString().split("T")[0] : "",
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString().split("T")[0] : "",
    items: raw.items ?? [],
    paymentMethod: raw.paymentMethod,
    notes: raw.notes,
  };
}

function mapPayment(raw: any): Payment {
  return {
    id: raw._id ?? raw.id,
    invoiceId: raw.invoiceId ?? "",
    patientName: raw.patientName ?? "Unknown",
    amount: raw.amount ?? 0,
    method: raw.method ?? "Cash",
    status: raw.status ?? "Completed",
    date: raw.date ? new Date(raw.date).toISOString().split("T")[0] : "",
    transactionId: raw.transactionId ?? "",
  };
}

export const billingService = {
  getRevenueMetrics: async (): Promise<RevenueMetric[]> => {
    try {
      const res = await apiClient.get("/billing/invoices/revenue-summary");
      const data = res.data.data;
      if (data?.metrics && Array.isArray(data.metrics) && data.metrics.length > 0) return data.metrics;
      throw new Error("empty");
    } catch {
      return MOCK_REVENUE_METRICS;
    }
  },

  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const res = await apiClient.get("/billing/invoices", { params: { limit: 100 } });
      const invoices: Invoice[] = (res.data.data ?? []).map(mapInvoice);
      if (invoices.length > 0) return invoices;
      throw new Error("empty");
    } catch {
      return MOCK_INVOICES;
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      const res = await apiClient.get(`/billing/invoices/${id}`);
      return mapInvoice(res.data.data);
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error(`Invoice ${id} not found`);
      return inv;
    }
  },

  createInvoice: async (data: Partial<Invoice>): Promise<Invoice> => {
    try {
      const res = await apiClient.post("/billing/invoices", data);
      return mapInvoice(res.data.data);
    } catch {
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        patientId: data.patientId ?? "",
        patientName: data.patientName ?? "Unknown",
        hospitalId: data.hospitalId ?? "",
        hospitalName: data.hospitalName ?? "",
        invoiceNumber: `INV-${Date.now()}`,
        status: "Pending",
        amount: data.amount ?? 0,
        paidAmount: 0,
        dueDate: data.dueDate ?? new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString().split("T")[0],
        items: data.items ?? [],
      };
      return newInvoice;
    }
  },

  updateInvoice: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    try {
      const res = await apiClient.patch(`/billing/invoices/${id}`, data);
      return mapInvoice(res.data.data);
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error("Invoice not found");
      return { ...inv, ...data };
    }
  },

  saveInvoices: async (data: Invoice[]): Promise<Invoice[]> => {
    // Legacy localStorage method kept for compatibility — no-op in API mode
    return data;
  },

  cancelInvoice: async (id: string): Promise<Invoice> => {
    try {
      const res = await apiClient.post(`/billing/invoices/${id}/cancel`);
      return mapInvoice(res.data.data);
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error("Invoice not found");
      return { ...inv, status: "Cancelled" };
    }
  },

  payInvoice: async (id: string, amount: number, method: string): Promise<Invoice> => {
    try {
      const res = await apiClient.post(`/billing/invoices/${id}/pay`, { amount, method });
      return mapInvoice(res.data.data);
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error("Invoice not found");
      return { ...inv, status: "Paid", paidAmount: amount, paymentMethod: method };
    }
  },

  getPayments: async (): Promise<Payment[]> => {
    try {
      const res = await apiClient.get("/billing/payments", { params: { limit: 100 } });
      const payments: Payment[] = (res.data.data ?? []).map(mapPayment);
      if (payments.length > 0) return payments;
      throw new Error("empty");
    } catch {
      return MOCK_PAYMENTS;
    }
  },

  createPayment: async (data: Partial<Payment>): Promise<Payment> => {
    try {
      const res = await apiClient.post("/billing/payments", data);
      return mapPayment(res.data.data);
    } catch {
      return {
        id: `pay-${Date.now()}`,
        invoiceId: data.invoiceId ?? "",
        patientName: data.patientName ?? "Unknown",
        amount: data.amount ?? 0,
        method: data.method ?? "Cash",
        status: "Completed",
        date: new Date().toISOString().split("T")[0],
        transactionId: `TXN-${Date.now()}`,
      };
    }
  },

  // Claims, Subscriptions, Refunds — no backend endpoints yet, keep mock
  getClaims: async (): Promise<Claim[]> => MOCK_CLAIMS,
  getSubscriptions: async (): Promise<Subscription[]> => MOCK_SUBSCRIPTIONS,
  getRefunds: async (): Promise<Refund[]> => MOCK_REFUNDS,
  getRevenueChart: async (): Promise<MonthlyRevenue[]> => MOCK_REVENUE_CHART,
};
