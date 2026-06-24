import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentTable } from "@/features/billing/components/PaymentTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PaymentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description="View and track all incoming payments"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />
      
      <div className="mt-6">
        <PaymentTable />
      </div>
    </PageContainer>
  );
}
