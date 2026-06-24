import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { HealthCard } from "@/features/monitoring/components/HealthCard";

export default function ServiceStatusPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Service Status"
        description="Current operational status of individual microservices and infrastructure components"
      />
      <div className="mt-6 max-w-4xl">
        <HealthCard />
      </div>
    </PageContainer>
  );
}
