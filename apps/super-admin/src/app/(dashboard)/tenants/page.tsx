"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TenantFilters } from "@/features/tenants/components/TenantFilters";
import { TenantTable } from "@/features/tenants/components/TenantTable";
import { TenantDeleteDialog } from "@/features/tenants/components/TenantDeleteDialog";
import { TenantSuspendDialog } from "@/features/tenants/components/TenantSuspendDialog";
import { TenantEditDialog } from "@/features/tenants/components/TenantEditDialog";
import {
  useTenants,
  useTenant,
  useUpdateTenant,
  useDeleteTenant,
  useSuspendTenant,
  useActivateTenant,
} from "@/features/tenants/hooks/useTenants";
import { Tenant } from "@/features/tenants/types/tenant.types";

function EditDialogWrapper({
  tenant,
  isOpen,
  onClose,
}: {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: details, isLoading } = useTenant(tenant?.id || "");
  const updateMutation = useUpdateTenant(tenant?.id || "");

  if (!isOpen || !tenant) return null;

  if (isLoading || !details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
        <div className="bg-card border border-border p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-foreground">Loading tenant settings...</span>
        </div>
      </div>
    );
  }

  return (
    <TenantEditDialog
      isOpen={isOpen}
      onClose={onClose}
      tenantDetails={details}
      isLoading={updateMutation.isPending}
      onConfirm={(data) => {
        updateMutation.mutate(data, {
          onSuccess: () => onClose(),
        });
      }}
    />
  );
}

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");

  // Dialogue triggers
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [tenantToSuspend, setTenantToSuspend] = useState<Tenant | null>(null);
  const [tenantToActivate, setTenantToActivate] = useState<Tenant | null>(null);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  // Queries & Mutations
  const { data: tenants = [], isLoading } = useTenants({
    search,
    status: status || undefined,
    plan: plan || undefined,
  });

  const deleteMutation = useDeleteTenant();
  const suspendMutation = useSuspendTenant();
  const activateMutation = useActivateTenant();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Tenants" }]} />
      
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Tenant Management"
          description="Create, monitor, and configure SaaS hospital tenants."
        />

        <TenantFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          plan={plan}
          onPlanChange={setPlan}
        />

        <TenantTable
          data={tenants}
          isLoading={isLoading}
          onEdit={setTenantToEdit}
          onSuspend={setTenantToSuspend}
          onActivate={setTenantToActivate}
          onDelete={setTenantToDelete}
        />
      </div>

      {/* Edit Dialog */}
      <EditDialogWrapper
        tenant={tenantToEdit}
        isOpen={!!tenantToEdit}
        onClose={() => setTenantToEdit(null)}
      />

      {/* Suspend Confirmation Dialog */}
      {tenantToSuspend && (
        <TenantSuspendDialog
          isOpen={!!tenantToSuspend}
          tenantName={tenantToSuspend.name}
          actionType="suspend"
          isLoading={suspendMutation.isPending}
          onClose={() => setTenantToSuspend(null)}
          onConfirm={() => {
            suspendMutation.mutate(tenantToSuspend.id, {
              onSuccess: () => setTenantToSuspend(null),
            });
          }}
        />
      )}

      {/* Activate Confirmation Dialog */}
      {tenantToActivate && (
        <TenantSuspendDialog
          isOpen={!!tenantToActivate}
          tenantName={tenantToActivate.name}
          actionType="activate"
          isLoading={activateMutation.isPending}
          onClose={() => setTenantToActivate(null)}
          onConfirm={() => {
            activateMutation.mutate(tenantToActivate.id, {
              onSuccess: () => setTenantToActivate(null),
            });
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {tenantToDelete && (
        <TenantDeleteDialog
          isOpen={!!tenantToDelete}
          tenantName={tenantToDelete.name}
          tenantCode={tenantToDelete.code}
          isDeleting={deleteMutation.isPending}
          onClose={() => setTenantToDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(tenantToDelete.id, {
              onSuccess: () => setTenantToDelete(null),
            });
          }}
        />
      )}
    </PageContainer>
  );
}
