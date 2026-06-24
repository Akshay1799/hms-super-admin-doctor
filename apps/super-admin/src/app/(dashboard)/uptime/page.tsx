import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { UptimeChart } from "@/features/monitoring/components/UptimeChart";

export default function UptimePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Uptime & Availability"
        description="Historical availability and response time analysis against SLA targets"
      />
      <div className="mt-6">
        <UptimeChart />
      </div>
    </PageContainer>
  );
}
