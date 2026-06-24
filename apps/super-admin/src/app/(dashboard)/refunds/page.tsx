import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RefundTable } from "@/features/billing/components/RefundTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function RefundsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Refunds"
        description="Track and manage patient refunds"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />
      
      <div className="mt-6">
        <RefundTable />
      </div>
    </PageContainer>
  );
}
