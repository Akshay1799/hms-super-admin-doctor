"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { UserForm } from "@/features/iam/components/UserForm";
import { useCreateUser } from "@/features/iam/hooks/useIam";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const { mutate: createUser, isPending } = useCreateUser();
  const router = useRouter();

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Users", href: "/users" },
          { label: "Create" },
        ]}
      />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Create User Profile"
          description="Register a new system administrator, practitioner, or operational user."
        />

        <UserForm
          isLoading={isPending}
          onSubmit={(data) => {
            createUser(data, {
              onSuccess: () => {
                router.push("/users");
              },
            });
          }}
        />
      </div>
    </PageContainer>
  );
}
