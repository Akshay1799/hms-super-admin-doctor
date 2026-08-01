"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceTable } from "@/features/billing/components/InvoiceTable";
import { CreateInvoiceForm } from "@/features/billing/components/CreateInvoiceForm";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useInvoices, useUpdateInvoices } from "@/features/billing/hooks/use-billing";
import { toast } from "sonner";
import { Invoice } from "@/features/billing/types/billing.types";

export default function InvoicesPage() {
  const { data: invoices = [] } = useInvoices();
  const updateInvoices = useUpdateInvoices();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



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

      {isAddModalOpen && (
        <CreateInvoiceForm
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={(invoice) => {
            const newInvoice = {
              id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              ...invoice,
              tenantId: `tenant-${Date.now()}`,
              status: "unpaid",
              issuedDate: new Date().toISOString(),
            } as Invoice;
            
            updateInvoices.mutate([...invoices, newInvoice], {
              onSuccess: () => {
                toast.success("New invoice generated successfully.");
                setIsAddModalOpen(false);
              }
            });
          }}
        />
      )}
    </PageContainer>
  );
}
