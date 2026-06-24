import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default function ComplianceReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Compliance Reports"
        description="Audit events, security metrics, and regulatory compliance status"
      />
      <div className="mt-6 flex items-center justify-center h-64 border border-dashed rounded-xl border-border bg-muted/20">
        <p className="text-muted-foreground text-sm font-medium">Compliance report views are currently in preview mode.</p>
      </div>
    </PageContainer>
  );
}
