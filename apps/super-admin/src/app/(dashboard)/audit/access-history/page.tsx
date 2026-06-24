import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { AccessHistoryTable } from "@/features/audit/components/AccessHistoryTable";

export default function AccessHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Access History"
        description="Track user logins, sessions, and device metadata across the platform"
      />
      <div className="mt-6">
        <AccessHistoryTable />
      </div>
    </PageContainer>
  );
}
