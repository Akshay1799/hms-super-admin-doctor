import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { DataAccessTable } from "@/features/audit/components/DataAccessTable";

export default function DataAccessPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Data Access Logs"
        description="Track all views, edits, and exports of sensitive entities like Patients and Invoices"
      />
      <div className="mt-6">
        <DataAccessTable />
      </div>
    </PageContainer>
  );
}
