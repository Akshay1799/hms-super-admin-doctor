import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ScheduledReportsTable } from "@/features/reports/components/ScheduledReportsTable";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function ScheduledReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Scheduled Reports"
        description="Manage automated report generation and delivery schedules"
        actions={<Button><Clock className="mr-2 h-4 w-4" />New Schedule</Button>}
      />
      <div className="mt-6">
        <ScheduledReportsTable />
      </div>
    </PageContainer>
  );
}
