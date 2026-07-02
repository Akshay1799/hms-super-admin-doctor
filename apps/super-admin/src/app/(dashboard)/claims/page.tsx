"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ClaimTable } from "@/features/billing/components/ClaimTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useClaims } from "@/features/billing/hooks/use-billing";
import { downloadCSV } from "@/utils/csv";
import { toast } from "sonner";

export default function ClaimsPage() {
  const { data: claims = [] } = useClaims();

  const handleExport = () => {
    if (claims.length === 0) {
      toast.error("No claims data available to export.");
      return;
    }
    downloadCSV(claims, "insurance-claims.csv");
    toast.success("Claims data exported successfully.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Insurance Claims"
        description="Monitor status of insurance claims across hospitals"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />
      
      <div className="mt-6">
        <ClaimTable />
      </div>
    </PageContainer>
  );
}
