import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SecurityEventsTable } from "@/features/audit/components/SecurityEventsTable";

export default function SecurityEventsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Security Events"
        description="Monitor failed logins, account lockouts, MFA changes, and role escalations"
      />
      <div className="mt-6">
        <SecurityEventsTable />
      </div>
    </PageContainer>
  );
}
