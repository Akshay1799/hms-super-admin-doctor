"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RoleForm } from "@/features/iam/components/RoleForm";
import { useCreateRole } from "@/features/iam/hooks/useIam";
import { useRouter } from "next/navigation";

export default function CreateRolePage() {
  const { mutate: createRole, isPending } = useCreateRole();
  const router = useRouter();

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Roles", href: "/roles" },
          { label: "Create" },
        ]}
      />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Create Custom Role"
          description="Provision a custom role and allocate permission checkpoints."
        />

        <RoleForm
          isLoading={isPending}
          onSubmit={(data) => {
            createRole(data, {
              onSuccess: () => {
                router.push("/roles");
              },
            });
          }}
        />
      </div>
    </PageContainer>
  );
}
