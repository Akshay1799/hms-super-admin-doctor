"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Banknote, Landmark, Smartphone, Wallet } from "lucide-react";
import { Invoice } from "../types/billing.types";
import { toast } from "sonner";

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"payment" | "refund">("payment");
  const [method, setMethod] = useState<"credit_card" | "cash" | "bank_transfer" | "upi" | "wallet">("credit_card");
  const [amount, setAmount] = useState<number>(invoice.totalAmount - (invoice.paidAmount || 0));
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate payment gateway delay
  const simulatePaymentGateway = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate real third-party API processing (e.g. Stripe, Razorpay)
      await simulatePaymentGateway(2000);

      // In a real implementation, we would call the actual backend API here
      // e.g. await apiClient.post(`/invoices/${invoice.id}/${activeTab}`, { amount, method })
      
      toast.success(
        activeTab === "payment" 
          ? `Successfully processed ₹${amount} via ${method.replace('_', ' ').toUpperCase()}`
          : `Successfully refunded ₹${amount}`
      );
      
      onSuccess();
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (m: string) => {
    switch (m) {
      case "credit_card": return <CreditCard className="h-5 w-5" />;
      case "cash": return <Banknote className="h-5 w-5" />;
      case "bank_transfer": return <Landmark className="h-5 w-5" />;
      case "upi": return <Smartphone className="h-5 w-5" />;
      case "wallet": return <Wallet className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Process Transaction</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground bg-secondary/50 p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 bg-secondary/30 p-1 rounded-lg">
          <button 
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'payment' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('payment'); setAmount(invoice.totalAmount - (invoice.paidAmount || 0)); }}
          >
            Collect Payment
          </button>
          <button 
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'refund' ? 'bg-destructive text-destructive-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('refund'); setAmount(invoice.paidAmount || 0); }}
          >
            Process Refund
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Invoice Total:</span>
            <span className="font-bold text-foreground">₹ {invoice.totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="bg-secondary/30 border border-border rounded-lg p-3 text-sm flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Already Paid:</span>
            <span className="font-bold text-foreground">₹ {(invoice.paidAmount || 0).toFixed(2)}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">{activeTab === 'payment' ? 'Amount to Collect' : 'Amount to Refund'}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <input 
                required 
                type="number" 
                min="1" 
                max={activeTab === 'payment' ? (invoice.totalAmount - (invoice.paidAmount || 0)) : (invoice.paidAmount || 0)} 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))} 
                className="h-12 w-full rounded-md border border-input bg-background pl-8 pr-3 text-lg font-medium focus:ring-2 focus:ring-primary/50" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTab === 'payment' 
                ? `Max collectable: ₹${(invoice.totalAmount - (invoice.paidAmount || 0)).toFixed(2)}` 
                : `Max refundable: ₹${(invoice.paidAmount || 0).toFixed(2)}`}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {["credit_card", "cash", "bank_transfer", "upi", "wallet"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m as any)}
                  className={`flex items-center gap-2 p-3 rounded-md border text-sm font-medium transition-colors ${
                    method === m 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-background hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {getMethodIcon(m)}
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isProcessing}>Cancel</Button>
            <Button type="submit" disabled={isProcessing || amount <= 0} className={activeTab === 'refund' ? "bg-destructive hover:bg-destructive/90" : ""}>
              {isProcessing ? "Processing..." : activeTab === 'payment' ? "Confirm Payment" : "Confirm Refund"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
