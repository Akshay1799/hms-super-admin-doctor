"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TenantStepperForm } from "@/features/tenants/components/TenantStepperForm";
import { useCreateTenant } from "@/features/tenants/hooks/useTenants";
import { useRouter } from "next/navigation";

export default function CreateTenantPage() {
  const { mutate: createTenant, isPending } = useCreateTenant();
  const router = useRouter();

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Tenants", href: "/tenants" },
          { label: "Create" },
        ]}
      />

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <PageHeader
          title="Onboard New Tenant"
          description="Provision a fresh multi-tenant workspace, set subscription details, and allocate initial system resources."
        />

        <TenantStepperForm
          isLoading={isPending}
          onSubmit={(data) => {
            createTenant(data, {
              onSuccess: () => {
                router.push("/tenants");
              },
            });
          }}
        />
      </div>
    </PageContainer>
  );
}
