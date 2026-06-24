import React, { useState } from "react";
import { HospitalDetails } from "../../services/hospital.service";
import { Department } from "../../types/hospital.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "../../hooks/useHospitals";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit2, Trash2, LayoutGrid } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, DepartmentInput } from "../../schemas/hospital.schema";

interface DepartmentsTabProps {
  details: HospitalDetails;
}

export function DepartmentsTab({ details }: DepartmentsTabProps) {
  const hospitalId = details.hospital.id;
  const branches = details.branches || [];

  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || "");
  const [depToEdit, setDepToEdit] = useState<Department | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [depToDelete, setDepToDelete] = useState<Department | null>(null);

  const { data: departments = [], isLoading } = useDepartments(selectedBranchId);
  const createMutation = useCreateDepartment(selectedBranchId, hospitalId);
  const updateMutation = useUpdateDepartment(selectedBranchId);
  const deleteMutation = useDeleteDepartment(selectedBranchId, hospitalId);

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema) as any,
    defaultValues: { name: "Cardiology", status: "Active" },
  });

  const handleCreateSubmit = (data: DepartmentInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        reset();
      },
    });
  };

  const columns: ColumnDef<Department, any>[] = [
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
      ),
    },
    { accessorKey: "doctorCount", header: "Doctors" },
    { accessorKey: "patientCount", header: "Patients" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const dep = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setDepToEdit(dep)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDepToDelete(dep)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
        <LayoutGrid className="h-8 w-8 mb-2 text-muted-foreground/45" />
        <p className="text-sm font-semibold">No Branches Available</p>
        <p className="text-xs mt-1">Please create a physical branch first before adding clinical departments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Clinical Departments</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage clinics and diagnostics operating in branch sites.</p>
          </div>
          {/* Branch Selector */}
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius-input)] border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-3 text-xs font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Department
        </button>
      </div>

      <AppTable columns={columns} data={departments} isLoading={isLoading} />

      {/* Create Department Dialog */}
      <ConfirmDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleSubmit(handleCreateSubmit)}
        title="Add Department"
        confirmText={createMutation.isPending ? "Adding..." : "Add Department"}
        cancelText="Cancel"
      >
        <div className="space-y-4 pt-2">
          <FormField label="Department Name" as="select" error={errors.name?.message} {...register("name")}>
            {["Cardiology", "Neurology", "Orthopedics", "Radiology", "Emergency", "Oncology", "Dermatology", "ENT", "Pediatrics", "Pathology"].map(
              (name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              )
            )}
          </FormField>
          <FormField label="Status" as="select" error={errors.status?.message} {...register("status")}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </FormField>
        </div>
      </ConfirmDialog>

      {/* Edit Department Dialog */}
      {depToEdit && (
        <EditDepartmentDialogWrapper
          dep={depToEdit}
          onClose={() => setDepToEdit(null)}
          onConfirm={(data) => {
            updateMutation.mutate(
              { depId: depToEdit.id, input: data },
              { onSuccess: () => setDepToEdit(null) }
            );
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete Department Dialog */}
      {depToDelete && (
        <ConfirmDialog
          isOpen={!!depToDelete}
          onClose={() => setDepToDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(depToDelete.id, {
              onSuccess: () => setDepToDelete(null),
            });
          }}
          title="Delete Department"
          description={`Are you sure you want to delete department "${depToDelete.name}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="destructive"
        />
      )}
    </div>
  );
}

function EditDepartmentDialogWrapper({
  dep,
  onClose,
  onConfirm,
  isPending,
}: {
  dep: Department;
  onClose: () => void;
  onConfirm: (data: Partial<Department>) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema) as any,
    defaultValues: { name: dep.name, status: dep.status as any },
  });

  return (
    <ConfirmDialog
      isOpen={true}
      onClose={onClose}
      onConfirm={handleSubmit(onConfirm)}
      title="Edit Department Settings"
      confirmText={isPending ? "Saving..." : "Save Changes"}
      cancelText="Cancel"
    >
      <div className="space-y-4 pt-2">
        <FormField label="Department Name" as="select" error={errors.name?.message} {...register("name")}>
          {["Cardiology", "Neurology", "Orthopedics", "Radiology", "Emergency", "Oncology", "Dermatology", "ENT", "Pediatrics", "Pathology"].map(
            (name) => (
              <option key={name} value={name}>
                {name}
              </option>
            )
          )}
        </FormField>
        <FormField label="Status" as="select" error={errors.status?.message} {...register("status")}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </FormField>
      </div>
    </ConfirmDialog>
  );
}
