import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { QueueTable } from "@/features/monitoring/components/QueueTable";

export default function QueueMonitorPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Queue Monitor"
        description="Real-time status of all BullMQ background task queues"
      />
      <div className="mt-6">
        <QueueTable />
      </div>
    </PageContainer>
  );
}
