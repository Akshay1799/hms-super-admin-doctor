import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RevenueChart } from "@/features/reports/components/RevenueChart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function RevenueReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Revenue Reports"
        description="Analyze platform-wide billing, collections, and outstanding trends"
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Report</Button>}
      />
      <div className="mt-6 max-w-4xl">
        <RevenueChart />
      </div>
    </PageContainer>
  );
}
