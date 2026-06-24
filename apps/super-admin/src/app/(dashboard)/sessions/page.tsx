"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SessionTable } from "@/features/iam/components/SessionTable";
import { useSessions } from "@/features/iam/hooks/useIam";

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useSessions();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Active Sessions" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Active Sessions"
          description="Monitor browser sessions, client IP addresses, and enforce force-logouts."
        />

        <SessionTable data={sessions} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
