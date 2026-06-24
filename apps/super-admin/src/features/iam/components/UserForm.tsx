import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserInput } from "../schemas/iam.schema";
import { FormField } from "@/components/ui/form-field";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { MOCK_BRANCHES } from "@/features/hospitals/mocks/hospitals.mock";
import { MOCK_ROLES } from "../mocks/iam.mocks";
import { Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserFormProps {
  onSubmit: (data: CreateUserInput) => void;
  defaultValues?: Partial<CreateUserInput>;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, defaultValues, isLoading = false }: UserFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: defaultValues || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      tenantId: "",
      hospitalId: "",
      branchId: "",
      status: "Active",
    },
  });

  const selectedTenantId = watch("tenantId");
  const selectedHospitalId = watch("hospitalId");

  const [filteredHospitals, setFilteredHospitals] = useState(MOCK_HOSPITALS);
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);

  // Dynamically filter hospitals when tenantId changes
  useEffect(() => {
    if (selectedTenantId) {
      const filtered = MOCK_HOSPITALS.filter((h) => h.tenantId === selectedTenantId);
      setFilteredHospitals(filtered);
      // Reset dependent select inputs
      setValue("hospitalId", "");
      setValue("branchId", "");
    } else {
      setFilteredHospitals([]);
      setFilteredBranches([]);
    }
  }, [selectedTenantId, setValue]);

  // Dynamically filter branches when hospitalId changes
  useEffect(() => {
    if (selectedHospitalId) {
      const branches = MOCK_BRANCHES[selectedHospitalId] || [];
      setFilteredBranches(branches);
      setValue("branchId", "");
    } else {
      setFilteredBranches([]);
    }
  }, [selectedHospitalId, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm max-w-3xl mx-auto"
    >
      <div>
        <h3 className="text-base font-bold text-foreground">User Information</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Specify personal identity and RBAC organizational boundaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <FormField
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        <FormField
          label="Primary Email"
          placeholder="john.doe@example.com"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Contact Phone"
          placeholder="+1 (555) 012-9844"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <FormField label="RBAC System Role" as="select" error={errors.role?.message} {...register("role")}>
          <option value="">Select Role</option>
          {MOCK_ROLES.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </FormField>
        <FormField label="Status" as="select" error={errors.status?.message} {...register("status")}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </FormField>

        <div className="col-span-full border-t border-border pt-4 mt-2">
          <h4 className="text-sm font-semibold text-foreground mb-3">SaaS Boundary Mapping</h4>
        </div>

        <FormField label="Tenant Scope" as="select" error={errors.tenantId?.message} {...register("tenantId")}>
          <option value="">Select Tenant</option>
          {MOCK_TENANTS.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </FormField>

        <FormField label="Hospital Node Access" as="select" error={errors.hospitalId?.message} {...register("hospitalId")}>
          <option value="">Select Hospital Node (Optional)</option>
          {filteredHospitals.map((hosp) => (
            <option key={hosp.id} value={hosp.id}>
              {hosp.name}
            </option>
          ))}
        </FormField>

        <div className="col-span-full md:col-span-1">
          <FormField label="Branch Node Access" as="select" error={errors.branchId?.message} {...register("branchId")}>
            <option value="">Select Physical Branch (Optional)</option>
            {filteredBranches.map((br) => (
              <option key={br.id} value={br.id}>
                {br.name} ({br.city})
              </option>
            ))}
          </FormField>
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
          {isLoading ? "Saving..." : "Save User Profile"}
          <Check className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
