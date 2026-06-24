import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default function AppointmentReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Appointment Reports"
        description="Monitor scheduling trends, cancellations, and reschedules"
      />
      <div className="mt-6 flex items-center justify-center h-64 border border-dashed rounded-xl border-border bg-muted/20">
        <p className="text-muted-foreground text-sm font-medium">Appointment report views are currently in preview mode.</p>
      </div>
    </PageContainer>
  );
}
