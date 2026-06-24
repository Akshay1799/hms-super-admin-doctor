import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ComplianceCards } from "@/features/audit/components/ComplianceCards";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function CompliancePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Compliance & Governance"
        description="Monitor regulatory adherence, sensitive operations, and retention policies"
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Generate Report</Button>}
      />
      <div className="mt-6">
        <ComplianceCards />
      </div>
    </PageContainer>
  );
}
