import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoleSchema, CreateRoleInput } from "../schemas/iam.schema";
import { FormField } from "@/components/ui/form-field";
import { MOCK_PERMISSIONS } from "../mocks/iam.mocks";
import { Check, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoleFormProps {
  onSubmit: (data: CreateRoleInput) => void;
  defaultValues?: Partial<CreateRoleInput>;
  isLoading?: boolean;
}

const ACTIONS = [
  { key: "create", label: "Create" },
  { key: "read", label: "Read" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

export function RoleForm({ onSubmit, defaultValues, isLoading = false }: RoleFormProps) {
  const router = useRouter();
  
  // Track permissions locally for easier tree checkboxes handling
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    defaultValues?.permissions || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema) as any,
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      status: defaultValues?.status || "Active",
    },
  });

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleFormSubmit = (data: Omit<CreateRoleInput, "permissions">) => {
    onSubmit({
      ...data,
      permissions: selectedPermissions,
    });
  };

  const isModuleChecked = (module: string) => {
    // Return true if all actions are selected for this module
    return ACTIONS.every((act) => selectedPermissions.includes(`${module.toLowerCase()}:${act.key}`));
  };

  const toggleModuleAll = (module: string) => {
    const keys = ACTIONS.map((act) => `${module.toLowerCase()}:${act.key}`);
    const alreadyAll = isModuleChecked(module);

    if (alreadyAll) {
      // Remove all keys
      setSelectedPermissions((prev) => prev.filter((p) => !keys.includes(p)));
    } else {
      // Add all missing keys
      setSelectedPermissions((prev) => {
        const added = keys.filter((k) => !prev.includes(k));
        return [...prev, ...added];
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm max-w-4xl mx-auto"
    >
      <div>
        <h3 className="text-base font-bold text-foreground">Role Specifications</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Specify name, description, and permission gates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Role Key / Name"
          placeholder="e.g. BILLING_SPECIALIST"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField label="Status" as="select" error={errors.status?.message} {...register("status")}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </FormField>
        <div className="col-span-full">
          <FormField
            label="Role Description"
            as="textarea"
            placeholder="What administrative actions is this role responsible for?"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>
      </div>

      {/* Permissions Checkbox Tree */}
      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Granular Permission Matrix</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Define access permissions for specific modules and resource endpoints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_PERMISSIONS.map((module) => {
            const isAll = isModuleChecked(module);
            return (
              <div key={module} className="p-4 border border-border rounded-xl bg-card/50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm font-bold text-foreground">{module}</span>
                  <button
                    type="button"
                    onClick={() => toggleModuleAll(module)}
                    className="text-xs text-primary font-semibold hover:text-primary/80 cursor-pointer"
                  >
                    {isAll ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map((act) => {
                    const permKey = `${module.toLowerCase()}:${act.key}`;
                    const isChecked = selectedPermissions.includes(permKey);
                    return (
                      <label
                        key={act.key}
                        className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/10 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(permKey)}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-muted-foreground">{act.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Create Role"}
        </button>
      </div>
    </form>
  );
}
