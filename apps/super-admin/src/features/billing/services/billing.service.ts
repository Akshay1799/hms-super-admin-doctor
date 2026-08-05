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
    id: raw._id ?? raw.id ?? `inv-${Date.now()}`,
    tenantId: raw.tenantId ?? "",
    tenantName: raw.tenantName ?? "Apollo Group",
    patientId: raw.patientId ?? "",
    patientName: raw.patientName ?? "Unknown",
    hospitalId: raw.hospitalId ?? "",
    hospitalName: raw.hospitalName ?? "",
    invoiceNumber: raw.invoiceNumber ?? raw.id ?? `INV-${Date.now()}`,
    invoiceType: raw.invoiceType ?? "OPD",
    billingMode: raw.billingMode ?? "Self-Pay",
    amount: raw.amount ?? 0,
    totalAmount: raw.totalAmount ?? raw.amount ?? 0,
    currency: raw.currency ?? "INR",
    status: raw.status ?? "unpaid",
    paidAmount: raw.paidAmount ?? 0,
    issuedDate: raw.issuedDate ? new Date(raw.issuedDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    items: raw.items ?? [],
  };
}

function mapPayment(raw: any): Payment {
  return {
    id: raw._id ?? raw.id ?? `pay-${Date.now()}`,
    invoiceId: raw.invoiceId ?? "",
    tenantId: raw.tenantId ?? "",
    tenantName: raw.tenantName ?? "",
    amount: raw.amount ?? 0,
    currency: raw.currency ?? "INR",
    type: raw.type ?? "payment",
    method: raw.method ?? "cash",
    status: raw.status ?? "completed",
    paymentDate: raw.paymentDate ? new Date(raw.paymentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    referenceId: raw.referenceId,
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
        tenantId: data.tenantId ?? "t1",
        tenantName: data.tenantName ?? "Apollo Group",
        patientId: data.patientId ?? "",
        patientName: data.patientName ?? "Unknown",
        hospitalId: data.hospitalId ?? "",
        hospitalName: data.hospitalName ?? "",
        invoiceNumber: `INV-${Date.now()}`,
        invoiceType: data.invoiceType ?? "OPD",
        billingMode: data.billingMode ?? "Self-Pay",
        amount: data.amount ?? 0,
        totalAmount: data.totalAmount ?? data.amount ?? 0,
        currency: "INR",
        status: "unpaid",
        paidAmount: 0,
        issuedDate: new Date().toISOString().split("T")[0],
        dueDate: data.dueDate ?? new Date().toISOString().split("T")[0],
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
    return data;
  },

  cancelInvoice: async (id: string): Promise<Invoice> => {
    try {
      const res = await apiClient.post(`/billing/invoices/${id}/cancel`);
      return mapInvoice(res.data.data);
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error("Invoice not found");
      return { ...inv, status: "cancelled" };
    }
  },

  payInvoice: async (id: string, amount: number, method: string): Promise<Invoice> => {
    try {
      const res = await apiClient.post(`/billing/invoices/${id}/pay`, { amount, method });
      return mapInvoice(res.data.data);
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error("Invoice not found");
      return { ...inv, status: "paid", paidAmount: amount };
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
        tenantId: data.tenantId ?? "t1",
        tenantName: data.tenantName ?? "Apollo Group",
        amount: data.amount ?? 0,
        currency: "INR",
        type: "payment",
        method: (data.method as any) ?? "cash",
        status: "completed",
        paymentDate: new Date().toISOString().split("T")[0],
        referenceId: `TXN-${Date.now()}`,
      };
    }
  },

  getClaims: async (): Promise<Claim[]> => MOCK_CLAIMS,
  getSubscriptions: async (): Promise<Subscription[]> => MOCK_SUBSCRIPTIONS,
  getRefunds: async (): Promise<Refund[]> => MOCK_REFUNDS,
  getRevenueChart: async (): Promise<MonthlyRevenue[]> => MOCK_REVENUE_CHART,
};
