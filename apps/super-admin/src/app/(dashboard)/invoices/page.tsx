import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceTable } from "@/features/billing/components/InvoiceTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InvoicesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Manage and track platform invoices"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />
      
      <div className="mt-6">
        <InvoiceTable />
      </div>
    </PageContainer>
  );
}
