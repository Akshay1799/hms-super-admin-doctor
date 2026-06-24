import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RevenueCards } from "@/features/billing/components/RevenueCards";
import { RevenueCharts } from "@/features/billing/components/RevenueCharts";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";

export default function RevenuePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Revenue Dashboard"
        description="Platform-wide financial overview and metrics"
        actions={
          <>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              This Month
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />
      
      <div className="space-y-6 mt-6">
        <RevenueCards />
        <RevenueCharts />
      </div>
    </PageContainer>
  );
}
