import React, { useState } from "react";
import { HospitalDetails } from "../../services/hospital.service";
import { Branch } from "../../types/hospital.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCreateBranch, useUpdateBranch, useDeleteBranch } from "../../hooks/useHospitals";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit2, Trash2, GitBranch } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema, BranchInput } from "../../schemas/hospital.schema";

interface BranchesTabProps {
  details: HospitalDetails;
}

export function BranchesTab({ details }: BranchesTabProps) {
  const hospitalId = details.hospital.id;
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const { data: branches = [] } = useCreateBranch(hospitalId); // Trigger Query Hook internally or pass as state? Since query hooks are simple, we can fetch directly or use details.branches as initial.
  // Wait! The query client has the branch query cache, so we can run useBranches(hospitalId) here!
  // Yes, let's call useBranches(hospitalId).
  const createMutation = useCreateBranch(hospitalId);
  const updateMutation = useUpdateBranch(hospitalId);
  const deleteMutation = useDeleteBranch(hospitalId);

  // Form setups
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema) as any,
    defaultValues: { name: "", code: "", city: "", status: "Active" },
  });

  const handleCreateSubmit = (data: BranchInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        reset();
      },
    });
  };

  const columns: ColumnDef<Branch, any>[] = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
      ),
    },
    { accessorKey: "city", header: "City" },
    { accessorKey: "doctorCount", header: "Doctors" },
    { accessorKey: "patientCount", header: "Patients" },
    { accessorKey: "departmentCount", header: "Departments" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setBranchToEdit(branch)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setBranchToDelete(branch)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Hospital Branches</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage localized physical branches and wings.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-3 text-xs font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Branch
        </button>
      </div>

      <AppTable columns={columns} data={details.branches} />

      {/* Create Branch Dialog */}
      <ConfirmDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleSubmit(handleCreateSubmit)}
        title="Add Branch"
        confirmText={createMutation.isPending ? "Adding..." : "Add Branch"}
        cancelText="Cancel"
      >
        <div className="space-y-4 pt-2">
          <FormField label="Branch Name" error={errors.name?.message} {...register("name")} />
          <FormField label="Branch Code" placeholder="e.g. AP-NY-MHT" error={errors.code?.message} {...register("code")} />
          <FormField label="City" error={errors.city?.message} {...register("city")} />
          <FormField label="Status" as="select" error={errors.status?.message} {...register("status")}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </FormField>
        </div>
      </ConfirmDialog>

      {/* Edit Branch Dialog */}
      {branchToEdit && (
        <EditBranchDialogWrapper
          branch={branchToEdit}
          onClose={() => setBranchToEdit(null)}
          onConfirm={(data) => {
            updateMutation.mutate(
              { branchId: branchToEdit.id, input: data },
              { onSuccess: () => setBranchToEdit(null) }
            );
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete Branch Dialog */}
      {branchToDelete && (
        <ConfirmDialog
          isOpen={!!branchToDelete}
          onClose={() => setBranchToDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(branchToDelete.id, {
              onSuccess: () => setBranchToDelete(null),
            });
          }}
          title="Delete Branch"
          description={`Are you sure you want to delete branch "${branchToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="destructive"
        />
      )}
    </div>
  );
}

function EditBranchDialogWrapper({
  branch,
  onClose,
  onConfirm,
  isPending,
}: {
  branch: Branch;
  onClose: () => void;
  onConfirm: (data: Partial<Branch>) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema) as any,
    defaultValues: { name: branch.name, code: branch.code, city: branch.city, status: branch.status as any },
  });

  return (
    <ConfirmDialog
      isOpen={true}
      onClose={onClose}
      onConfirm={handleSubmit(onConfirm)}
      title="Edit Branch Settings"
      confirmText={isPending ? "Saving..." : "Save Changes"}
      cancelText="Cancel"
    >
      <div className="space-y-4 pt-2">
        <FormField label="Branch Name" error={errors.name?.message} {...register("name")} />
        <FormField label="Branch Code" error={errors.code?.message} {...register("code")} disabled />
        <FormField label="City" error={errors.city?.message} {...register("city")} />
        <FormField label="Status" as="select" error={errors.status?.message} {...register("status")}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </FormField>
      </div>
    </ConfirmDialog>
  );
}
