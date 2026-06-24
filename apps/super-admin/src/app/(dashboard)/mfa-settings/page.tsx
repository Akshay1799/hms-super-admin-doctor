"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MfaTable } from "@/features/iam/components/MfaTable";
import { useMfa } from "@/features/iam/hooks/useIam";

export default function MfaPage() {
  const { data: mfaList = [], isLoading } = useMfa();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "MFA Settings" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Multi-Factor Authentication (MFA)"
          description="Enforce or configure OTP policies and authenticator enrollment statuses."
        />

        <MfaTable data={mfaList} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
