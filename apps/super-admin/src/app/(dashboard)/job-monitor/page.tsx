import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { JobTable } from "@/features/monitoring/components/JobTable";

export default function JobMonitorPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Job Monitor"
        description="Track execution status and retry history of individual background jobs"
      />
      <div className="mt-6">
        <JobTable />
      </div>
    </PageContainer>
  );
}
