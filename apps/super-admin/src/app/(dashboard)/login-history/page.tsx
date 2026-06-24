"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LoginHistoryTable } from "@/features/iam/components/LoginHistoryTable";
import { useLoginHistory } from "@/features/iam/hooks/useIam";

export default function LoginHistoryPage() {
  const { data: history = [], isLoading } = useLoginHistory();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Login History" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Login History"
          description="Timeline audit logs of logins, authentication attempts, and IP locations."
        />

        <LoginHistoryTable data={history} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
