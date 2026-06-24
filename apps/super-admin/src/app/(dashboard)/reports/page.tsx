import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ReportStatsCards } from "@/features/reports/components/ReportStatsCards";
import { ScheduledReportsTable } from "@/features/reports/components/ScheduledReportsTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ReportsDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reports Hub"
        description="Centralized access to all platform-wide analytics, financial reports, and data exports"
        actions={<Button><PlusCircle className="mr-2 h-4 w-4" />Create Custom Report</Button>}
      />
      <div className="mt-6 space-y-6">
        <ReportStatsCards />
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Active Scheduled Reports</h3>
          <ScheduledReportsTable />
        </div>
      </div>
    </PageContainer>
  );
}
