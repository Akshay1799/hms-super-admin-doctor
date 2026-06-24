"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { HospitalFilters } from "@/features/hospitals/components/HospitalFilters";
import { HospitalTable } from "@/features/hospitals/components/HospitalTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  useHospitals,
  useSuspendHospital,
  useActivateHospital,
  useDeleteHospital,
} from "@/features/hospitals/hooks/useHospitals";
import { Hospital } from "@/features/hospitals/types/hospital.types";

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  // Dialog triggers
  const [hospToDelete, setHospToDelete] = useState<Hospital | null>(null);
  const [hospToSuspend, setHospToSuspend] = useState<Hospital | null>(null);
  const [hospToActivate, setHospToActivate] = useState<Hospital | null>(null);

  // Queries & Mutations
  const { data: hospitals = [], isLoading } = useHospitals({
    search,
    tenantId: tenantId || undefined,
    type: type || undefined,
    status: status || undefined,
  });

  const deleteMutation = useDeleteHospital();
  const suspendMutation = useSuspendHospital();
  const activateMutation = useActivateHospital();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Hospitals" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Hospitals"
          description="Manage clinical nodes, branches, and departments across SaaS tenants."
        />

        <HospitalFilters
          search={search}
          onSearchChange={setSearch}
          tenantId={tenantId}
          onTenantChange={setTenantId}
          type={type}
          onTypeChange={setType}
          status={status}
          onStatusChange={setStatus}
        />

        <HospitalTable
          data={hospitals}
          isLoading={isLoading}
          onSuspend={setHospToSuspend}
          onActivate={setHospToActivate}
          onDelete={setHospToDelete}
        />
      </div>

      {/* Suspend Confirmation Dialog */}
      {hospToSuspend && (
        <ConfirmDialog
          isOpen={!!hospToSuspend}
          onClose={() => setHospToSuspend(null)}
          onConfirm={() => {
            suspendMutation.mutate(hospToSuspend.id, {
              onSuccess: () => setHospToSuspend(null),
            });
          }}
          title="Suspend Hospital Operations"
          description={`Are you sure you want to suspend "${hospToSuspend.name}"? This blocks logins for doctors and staff within this unit.`}
          confirmText={suspendMutation.isPending ? "Suspending..." : "Suspend"}
          cancelText="Cancel"
          type="destructive"
        />
      )}

      {/* Activate Confirmation Dialog */}
      {hospToActivate && (
        <ConfirmDialog
          isOpen={!!hospToActivate}
          onClose={() => setHospToActivate(null)}
          onConfirm={() => {
            activateMutation.mutate(hospToActivate.id, {
              onSuccess: () => setHospToActivate(null),
            });
          }}
          title="Activate Hospital Operations"
          description={`Are you sure you want to activate "${hospToActivate.name}"? This restores login capabilities for all staff.`}
          confirmText={activateMutation.isPending ? "Activating..." : "Activate"}
          cancelText="Cancel"
          type="info"
        />
      )}

      {/* Delete Confirmation Dialog */}
      {hospToDelete && (
        <DeleteDialog
          isOpen={!!hospToDelete}
          onClose={() => setHospToDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(hospToDelete.id, {
              onSuccess: () => setHospToDelete(null),
            });
          }}
          title="Delete Hospital Node"
          description="WARNING: Deleting this hospital will permanently remove all nested branches, outpatient wings, departments, and capacity configurations."
          itemName={hospToDelete.name}
        />
      )}
    </PageContainer>
  );
}
