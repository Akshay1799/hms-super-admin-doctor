import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ApiLatencyTable } from "@/features/monitoring/components/ApiLatencyTable";

export default function ApiHealthPage() {
  return (
    <PageContainer>
      <PageHeader
        title="API Health"
        description="Monitor endpoint latency, error rates, and traffic volume"
      />
      <div className="mt-6">
        <ApiLatencyTable />
      </div>
    </PageContainer>
  );
}
