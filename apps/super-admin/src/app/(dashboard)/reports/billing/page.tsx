import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default function BillingReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Billing Reports"
        description="Detailed breakdowns of invoices, payments, and refunds"
      />
      <div className="mt-6 flex items-center justify-center h-64 border border-dashed rounded-xl border-border bg-muted/20">
        <p className="text-muted-foreground text-sm font-medium">Billing report views are currently in preview mode.</p>
      </div>
    </PageContainer>
  );
}
