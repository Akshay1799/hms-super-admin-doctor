import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ActivityTimeline } from "@/features/audit/components/ActivityTimeline";

export default function ActivityTimelinePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Activity Timeline"
        description="Chronological view of all system changes and important events"
      />
      <div className="mt-6 max-w-3xl bg-card border border-border rounded-xl p-6">
        <ActivityTimeline />
      </div>
    </PageContainer>
  );
}
