"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  Receipt
} from "lucide-react";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  tenantName: string;
  totalAmount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue" | "cancelled";
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
}

export default function PatientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  
  // Payment Modal States
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get("/billing/invoices");
      // listInvoices response structure returns data directly or wrapped in standard api envelope
      const list = res.data?.data || res.data || [];
      setInvoices(list);
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve invoices catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setActivePaymentInvoice(invoice);
    setCardForm({ number: "", expiry: "", cvv: "", name: "" });
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice) return;

    // Basic validation
    if (cardForm.number.length < 16 || cardForm.expiry.length < 5 || cardForm.cvv.length < 3 || !cardForm.name) {
      toast.error("Please fill in valid card credentials");
      return;
    }

    try {
      setIsSimulatingPayment(true);
      // Simulate 1.5 seconds payment authorization processing gateway step
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPayingId(activePaymentInvoice._id);
      await apiClient.post(`/billing/invoices/${activePaymentInvoice._id}/pay`, { method: "card" });
      
      toast.success("Transaction authorized! Invoice successfully settled.");
      setActivePaymentInvoice(null);
      await fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Payment transaction authorization failed");
    } finally {
      setIsSimulatingPayment(false);
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid" || inv.status === "overdue");
  const totalOutstanding = unpaidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Invoices</span>
            <p className="text-2xl font-black text-foreground mt-1">{invoices.length}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Outstanding Balance</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              ₹{totalOutstanding.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Settled Payments</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {invoices.length - unpaidInvoices.length} Paid
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
          <FileText className="h-4 w-4 text-primary" /> Invoice History Ledger
        </h3>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2.5 font-bold uppercase">Invoice No</th>
                  <th className="py-2.5 font-bold uppercase">Facility / Group</th>
                  <th className="py-2.5 font-bold uppercase">Billing Details</th>
                  <th className="py-2.5 font-bold uppercase">Total Amount</th>
                  <th className="py-2.5 font-bold uppercase">Status</th>
                  <th className="py-2.5 font-bold uppercase">Due Date</th>
                  <th className="py-2.5 font-bold uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-muted/30">
                    <td className="py-3.5 font-bold text-foreground">{inv.invoiceNumber}</td>
                    <td className="py-3.5 font-medium text-muted-foreground">{inv.tenantName}</td>
                    <td className="py-3.5 text-muted-foreground font-medium">
                      {inv.items && inv.items.length > 0 ? inv.items[0].description : "Clinical Consultation"}
                    </td>
                    <td className="py-3.5 font-bold text-foreground">
                      {inv.currency || "INR"} {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          inv.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : inv.status === "unpaid"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {inv.status === "paid" ? (
                          <>
                            <CheckCircle className="h-3 w-3" /> Paid
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Settle Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right">
                      {inv.status !== "paid" ? (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          disabled={payingId === inv._id}
                          className="h-8 px-3 bg-primary hover:bg-primary/90 text-white rounded text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                        >
                          <CreditCard className="h-3 w-3" /> Pay Now
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold italic">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic text-center py-6">No billing invoices recorded currently.</p>
        )}
      </div>

      {/* Simulated Payment Gateway Checkout Modal */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 relative">
            <div className="border-b border-border pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-extrabold text-sm text-foreground">Secure Payment Gateway</span>
              </div>
              <button
                onClick={() => !isSimulatingPayment && setActivePaymentInvoice(null)}
                disabled={isSimulatingPayment}
                className="text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer disabled:opacity-30"
              >
                Cancel
              </button>
            </div>

            {/* Bill Breakdown */}
            <div className="bg-muted/40 p-3.5 rounded-xl border border-border/30 text-xs space-y-2">
              <div className="flex justify-between font-bold text-foreground">
                <span>Invoice Number:</span>
                <span className="font-mono">{activePaymentInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Hospital/Group:</span>
                <span>{activePaymentInvoice.tenantName}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-extrabold text-foreground">
                <span>Total Charge:</span>
                <span className="text-primary text-sm">₹{activePaymentInvoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Card Number</label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="1234 5678 1234 5678"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, "") })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    placeholder="MM/YY"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    value={cardForm.expiry}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length === 2 && !val.includes("/")) val += "/";
                      setCardForm({ ...cardForm, expiry: val });
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">CVV Code</label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    placeholder="•••"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentInvoice(null)}
                  disabled={isSimulatingPayment}
                  className="w-1/2 h-10 bg-muted hover:bg-muted/80 disabled:opacity-40 text-muted-foreground text-xs font-bold rounded-lg cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingPayment}
                  className="w-1/2 h-10 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isSimulatingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
