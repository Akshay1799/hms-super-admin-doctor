import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ClaimTable } from "@/features/billing/components/ClaimTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ClaimsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Insurance Claims"
        description="Monitor status of insurance claims across hospitals"
        actions={
          <Button variant="outline">
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
