"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Search,
  Receipt,
  User,
  Plus,
  Loader2,
  FileText,
  DollarSign,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

interface PatientItem {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  hospitalId?: {
    _id: string;
    name: string;
  } | string;
  departmentId?: {
    _id: string;
    name: string;
  };
}

interface PreviewItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: string;
}

export default function BillingPage() {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [preview, setPreview] = useState<{
    items: PreviewItem[];
    summary: { subtotal: number; tax: number; total: number };
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  const fetchPatients = async () => {
    try {
      const res = await apiClient.get("/patients?limit=50");
      setPatients(res.data.data || []);
    } catch {
      toast.error("Failed to load patients for checkout");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientChange = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setPreview(null);
    setGeneratedInvoice(null);
    if (!patientId) return;

    try {
      setIsLoadingPreview(true);
      const res = await apiClient.get(`/checkout/preview/${patientId}`);
      setPreview(res.data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load checkout preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedPatientId || !preview) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/checkout/invoice", {
        patientId: selectedPatientId,
        items: preview.items,
        subtotal: preview.summary.subtotal,
        taxAmount: preview.summary.tax,
        totalAmount: preview.summary.total,
        notes: notes,
      });

      toast.success("Consolidated billing invoice generated!");
      setGeneratedInvoice(res.data.data);
      setPreview(null);
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div id="billing-page-header">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">Billing & Checkout Center</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Consolidate physician consultations, EMR medications, and diagnostic scans to checkout patients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Patient Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Patient Selector</h3>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Patient for Checkout</label>
              <div className="relative">
                <select
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  value={selectedPatientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat._id} value={pat._id}>
                      {pat.name} ({pat.phone || "No phone"})
                    </option>
                  ))}
                </select>
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {selectedPatientId && (
              <div className="text-xs bg-muted/40 p-3 rounded-lg space-y-2 border border-border/30">
                <p className="font-bold text-foreground">Active Case Status</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>EMR Status:</span>
                  <span className="font-bold text-primary">{patients.find(p => p._id === selectedPatientId)?.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Invoice Preview / Summary */}
        <div className="lg:col-span-2">
          {isLoadingPreview && (
            <div className="h-48 border border-border bg-card rounded-xl flex items-center justify-center shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-xs font-semibold text-muted-foreground">Calculating unbilled items...</span>
            </div>
          )}

          {!isLoadingPreview && !preview && !generatedInvoice && (
            <div className="h-48 border border-border border-dashed bg-card/50 rounded-xl flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <Receipt className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-xs font-bold text-muted-foreground">No patient selected</p>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">Choose an active patient on the left to start checkout calculations.</p>
            </div>
          )}

          {/* Generated Invoice View */}
          {generatedInvoice && (() => {
            const activePatient = patients.find(p => p._id === selectedPatientId);
            return (
              <div id="printable-invoice" className="border border-slate-200 bg-white rounded-2xl p-8 space-y-6 shadow-xs">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-sm font-extrabold text-[#0F4C81] tracking-tight uppercase">
                      {generatedInvoice.hospitalName || (typeof activePatient?.hospitalId === 'object' ? activePatient.hospitalId?.name : undefined) || "MediPlus Hospital"}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold">Official Clinical Checkout Invoice</p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-mono">
                      {generatedInvoice.invoiceNumber}
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Date: {new Date(generatedInvoice.issuedDate || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Patient Information Section */}
                <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Patient Details</h4>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900">{generatedInvoice.patientName}</p>
                      <p className="text-xs text-slate-500">{activePatient?.phone || "+91 9988776655"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hospital Reference</h4>
                    <div className="space-y-0.5 text-xs text-slate-600">
                      <p>
                        <span className="font-bold text-slate-500">Department:</span> {activePatient?.departmentId?.name || "Cardiology Unit"}
                      </p>
                      <p>
                        <span className="font-bold text-slate-500">Checkout Purpose:</span> Clinical Case Checkout & EMR Settlement
                      </p>
                    </div>
                  </div>
                </div>

                {/* Itemized Billing Statement Section */}
                <div className="space-y-2.5 mt-6">
                  <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Itemized Billing Statement</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center w-16">Qty</th>
                          <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-right w-24">Unit Price</th>
                          <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-right w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generatedInvoice.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800">{item.description}</td>
                            <td className="px-4 py-3 text-center text-slate-500 font-semibold">{item.quantity || 1}</td>
                            <td className="px-4 py-3 text-right text-slate-400">₹{(item.unitPrice || item.total).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-extrabold text-slate-900">₹{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t border-slate-100 pt-5 flex justify-end">
                  <table className="w-64 text-xs border-collapse">
                    <tbody>
                      <tr className="text-slate-500">
                        <td className="py-1 text-right pr-6">Subtotal</td>
                        <td className="py-1 text-right font-extrabold text-slate-900">₹{(generatedInvoice.amount || generatedInvoice.totalAmount / 1.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      </tr>
                      <tr className="text-slate-500">
                        <td className="py-1 text-right pr-6">GST (18%)</td>
                        <td className="py-1 text-right font-extrabold text-slate-900">₹{(generatedInvoice.taxAmount || generatedInvoice.totalAmount - (generatedInvoice.totalAmount / 1.18)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      </tr>
                      <tr className="border-t border-slate-100 font-bold text-slate-900">
                        <td className="pt-3 pb-1 text-right pr-6 text-sm">Total Paid</td>
                        <td className="pt-3 pb-1 text-right text-[#0F4C81] text-base font-black">₹{generatedInvoice.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Invoice Footer / Terms */}
                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                    This is a computer-generated official billing receipt. No signature is required. For any inquiries regarding medical records or billing settlement details, please reach out to the administrative billing desk.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 print-hide border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="h-10 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setGeneratedInvoice(null)}
                    className="h-10 px-5 bg-[#0F4C81] hover:bg-[#0c3e69] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Invoice Preview View */}
          {preview && (
            <div className="border border-border bg-card rounded-xl p-6 space-y-6 shadow-sm">
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Consolidated Checkout Preview
                </h3>
                <span className="text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2 py-0.5 rounded font-black uppercase">
                  Pending Invoice
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Line Items</p>
                <div className="divide-y divide-border border border-border rounded-lg bg-background overflow-hidden">
                  {preview.items.map((item, idx) => {
                    const badgeColor =
                      item.type === "consultation"
                        ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600"
                        : item.type === "medication"
                        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600"
                        : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600";

                    return (
                      <div key={idx} className="flex justify-between items-center p-3 text-xs gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-foreground truncate">{item.description}</p>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${badgeColor}`}>
                            {item.type}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-foreground">₹{item.total.toLocaleString()}</p>
                          <p className="text-[9px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Billing Notes / Comments</label>
                <textarea
                  placeholder="Add any billing annotations, insurance panel details, or discount notes..."
                  className="w-full h-16 p-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Summary Breakdowns */}
              <div className="border-t border-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{preview.summary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18% Flat Rate)</span>
                  <span className="font-semibold text-foreground">₹{preview.summary.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground border-t border-border pt-3 font-extrabold text-sm">
                  <span>Total Amount Due</span>
                  <span className="text-base font-black text-primary">₹{preview.summary.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="h-10 px-4 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold rounded-lg cursor-pointer"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleCreateInvoice}
                  disabled={isSubmitting}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate Consolidated Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
