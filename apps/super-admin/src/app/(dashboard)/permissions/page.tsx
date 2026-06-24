"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PermissionMatrix } from "@/features/iam/components/PermissionMatrix";

export default function PermissionsPage() {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Permissions" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Permissions"
          description="View and manage granular access privileges across SaaS modules."
        />

        <PermissionMatrix />
      </div>
    </PageContainer>
  );
}
