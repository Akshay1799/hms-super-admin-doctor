import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ExportHistoryTable } from "@/features/reports/components/ExportHistoryTable";

export default function ExportHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Export History"
        description="Track all generated files and report downloads across the platform"
      />
      <div className="mt-6">
        <ExportHistoryTable />
      </div>
    </PageContainer>
  );
}
