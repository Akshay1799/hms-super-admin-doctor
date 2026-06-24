import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { DatabaseHealthCard } from "@/features/monitoring/components/DatabaseHealthCard";

export default function DatabaseHealthPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Database Health"
        description="Monitor performance, connections, and storage of core databases"
      />
      <div className="mt-6">
        <DatabaseHealthCard />
      </div>
    </PageContainer>
  );
}
