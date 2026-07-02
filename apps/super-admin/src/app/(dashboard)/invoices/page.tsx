"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceTable } from "@/features/billing/components/InvoiceTable";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useInvoices, useUpdateInvoices } from "@/features/billing/hooks/use-billing";
import { toast } from "sonner";
import { Invoice } from "@/features/billing/types/billing.types";

export default function InvoicesPage() {
  const { data: invoices = [] } = useInvoices();
  const updateInvoices = useUpdateInvoices();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantName = formData.get("tenantName") as string;
    const amount = Number(formData.get("amount"));
    const dueDate = formData.get("dueDate") as string;

    const newInvoice: Invoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: `tenant-${Date.now()}`,
      tenantName,
      amount,
      currency: "USD",
      dueDate,
      status: "unpaid",
      issuedDate: new Date().toISOString(),
      items: [],
    };

    updateInvoices.mutate([...invoices, newInvoice], {
      onSuccess: () => {
        toast.success("New invoice created successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Manage and track platform invoices"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />
      
      <div className="mt-6">
        <InvoiceTable />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Create Platform Invoice</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tenant / Organization</label>
                <input required type="text" name="tenantName" placeholder="e.g. CareFirst Clinics" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Invoice Amount ($)</label>
                <input required type="number" min="1" name="amount" defaultValue="250" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                <input required type="date" name="dueDate" defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
