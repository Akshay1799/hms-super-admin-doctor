"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RoleTable } from "@/features/iam/components/RoleTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRoles, useDeleteRole, useDuplicateRole } from "@/features/iam/hooks/useIam";
import { Role } from "@/features/iam/types/iam.types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RolesPage() {
  const router = useRouter();
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const { data: roles = [], isLoading } = useRoles();
  const deleteMutation = useDeleteRole();
  const duplicateMutation = useDuplicateRole();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Roles" }]} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Role Management"
            description="Create and customize RBAC roles and permissions mapping settings."
          />
          <Link
            href="/roles/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Role
          </Link>
        </div>

        <RoleTable
          data={roles}
          isLoading={isLoading}
          onEdit={(role) => router.push(`/permissions?role=${role.id}`)} // Redirect to permissions matrix
          onDuplicate={(role) => duplicateMutation.mutate(role.id)}
          onDelete={setRoleToDelete}
        />
      </div>

      {/* Delete Confirmation */}
      {roleToDelete && (
        <ConfirmDialog
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(roleToDelete.id, {
              onSuccess: () => setRoleToDelete(null),
            });
          }}
          title="Delete Custom Role"
          description={`Are you sure you want to delete the role "${roleToDelete.name}"? Users assigned to this role will lose their access permissions.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="destructive"
        />
      )}
    </PageContainer>
  );
}
