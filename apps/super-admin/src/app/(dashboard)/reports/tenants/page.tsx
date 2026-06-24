import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TenantReportsTable } from "@/features/reports/components/TenantReportsTable";

export default function TenantReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tenant Reports"
        description="Metrics on tenant growth, storage usage, API consumption, and revenue"
      />
      <div className="mt-6">
        <TenantReportsTable />
      </div>
    </PageContainer>
  );
}
