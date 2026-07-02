"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ComplianceCards } from "@/features/audit/components/ComplianceCards";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import { toast } from "sonner";

export default function CompliancePage() {
  const handleGenerate = () => {
    const mockComplianceData = [
      { Standard: "HIPAA Security Rule", Score: "98%", Status: "Compliant", LastAudited: "2026-06-15" },
      { Standard: "HIPAA Privacy Rule", Score: "100%", Status: "Compliant", LastAudited: "2026-06-16" },
      { Standard: "GDPR Core Gates", Score: "95%", Status: "Compliant", LastAudited: "2026-06-18" },
      { Standard: "SOC 2 Type II", Score: "92%", Status: "Compliant", LastAudited: "2026-05-30" },
      { Standard: "ISO 27001", Score: "88%", Status: "In Progress", LastAudited: "2026-06-01" },
    ];
    downloadCSV(mockComplianceData, "hipaa-compliance-report.csv");
    toast.success("HIPAA Compliance Report downloaded successfully.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Compliance & Governance"
        description="Monitor regulatory adherence, sensitive operations, and retention policies"
        actions={<Button variant="outline" onClick={handleGenerate}>
          <Download className="mr-2 h-4 w-4" />Generate Report
        </Button>}
      />
      <div className="mt-6">
        <ComplianceCards />
      </div>
    </PageContainer>
  );
}
