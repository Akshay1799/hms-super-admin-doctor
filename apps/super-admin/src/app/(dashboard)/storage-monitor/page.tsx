import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StorageChart } from "@/features/monitoring/components/StorageChart";

export default function StorageMonitorPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Storage Monitor"
        description="Track file storage growth and content distribution across the platform"
      />
      <div className="mt-6">
        <StorageChart />
      </div>
    </PageContainer>
  );
}
