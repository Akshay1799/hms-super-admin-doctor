import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTenantSchema, CreateTenantInput } from "../schemas/tenant.schema";
import { TenantDetails } from "../services/tenant.service";
import { FormField } from "@/components/ui/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { X, Check } from "lucide-react";

interface TenantEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<CreateTenantInput>) => void;
  tenantDetails: TenantDetails;
  isLoading?: boolean;
}

type TabType = "general" | "quotas" | "features";

export function TenantEditDialog({
  isOpen,
  onClose,
  onConfirm,
  tenantDetails,
  isLoading = false,
}: TenantEditDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<CreateTenantInput>>({
    resolver: zodResolver(updateTenantSchema) as any,
    defaultValues: {
      name: tenantDetails.tenant.name,
      plan: tenantDetails.tenant.plan as any,
      status: tenantDetails.tenant.status as any,
      billingCycle: tenantDetails.subscription.billingCycle as any,
      primaryDomain: tenantDetails.domain.primaryDomain,
      customDomain: tenantDetails.domain.customDomain ?? "",
      sslEnabled: tenantDetails.domain.sslEnabled,
      emr: tenantDetails.featureFlags.emr,
      appointments: tenantDetails.featureFlags.appointments,
      billing: tenantDetails.featureFlags.billing,
      pharmacy: tenantDetails.featureFlags.pharmacy,
      inventory: tenantDetails.featureFlags.inventory,
      laboratory: tenantDetails.featureFlags.laboratory,
      radiology: tenantDetails.featureFlags.radiology,
      insurance: tenantDetails.featureFlags.insurance,
      telemedicine: tenantDetails.featureFlags.telemedicine,
      notifications: tenantDetails.featureFlags.notifications,
      reports: tenantDetails.featureFlags.reports,
      maxHospitals: tenantDetails.quota.hospitals.max,
      maxBranches: tenantDetails.quota.branches.max,
      maxDoctors: tenantDetails.quota.doctors.max,
      maxStaff: tenantDetails.quota.staff.max,
      maxPatients: tenantDetails.quota.patients.max,
      maxStorage: tenantDetails.quota.storage.max,
      maxApiCalls: tenantDetails.quota.apiCalls.max,
    },
  });

  const onSubmit = (data: Partial<CreateTenantInput>) => {
    onConfirm(data);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "general", label: "General & Billing" },
    { id: "quotas", label: "Limits & Quotas" },
    { id: "features", label: "Feature Flags" },
  ];

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit(onSubmit)}
      title={`Edit Settings - ${tenantDetails.tenant.name}`}
      confirmText={isLoading ? "Saving..." : "Save Changes"}
      cancelText="Cancel"
      type="info"
      size="xl"
    >
      <div className="space-y-4 pt-2">
        {/* Tab Headers */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[320px] max-h-[50vh] overflow-y-auto pr-1">
          {/* GENERAL & BILLING */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
              <FormField
                label="Tenant Name"
                error={errors.name?.message}
                {...register("name")}
              />
              <FormField
                label="Primary Domain"
                error={errors.primaryDomain?.message}
                {...register("primaryDomain")}
              />
              <FormField
                label="Custom Domain"
                error={errors.customDomain?.message}
                {...register("customDomain")}
              />
              <FormField
                label="Subscription Plan"
                as="select"
                error={errors.plan?.message}
                {...register("plan")}
              >
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </FormField>
              <FormField
                label="Billing Cycle"
                as="select"
                error={errors.billingCycle?.message}
                {...register("billingCycle")}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </FormField>
              <FormField
                label="Status"
                as="select"
                error={errors.status?.message}
                {...register("status")}
              >
                <option value="Trial">Trial</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </FormField>
              <div className="md:col-span-2 flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="sslEnabledEdit"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  {...register("sslEnabled")}
                />
                <label htmlFor="sslEnabledEdit" className="text-sm font-semibold text-foreground">
                  SSL Active (HTTPS)
                </label>
              </div>
            </div>
          )}

          {/* LIMITS & QUOTAS */}
          {activeTab === "quotas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-150">
              <FormField
                label="Hospitals Limit"
                type="number"
                error={errors.maxHospitals?.message}
                {...register("maxHospitals")}
              />
              <FormField
                label="Branches Limit"
                type="number"
                error={errors.maxBranches?.message}
                {...register("maxBranches")}
              />
              <FormField
                label="Doctors Limit"
                type="number"
                error={errors.maxDoctors?.message}
                {...register("maxDoctors")}
              />
              <FormField
                label="Staff Limit"
                type="number"
                error={errors.maxStaff?.message}
                {...register("maxStaff")}
              />
              <FormField
                label="Patients Limit"
                type="number"
                error={errors.maxPatients?.message}
                {...register("maxPatients")}
              />
              <FormField
                label="Storage Limit (GB)"
                type="number"
                error={errors.maxStorage?.message}
                {...register("maxStorage")}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Monthly API Requests Quota"
                  type="number"
                  error={errors.maxApiCalls?.message}
                  {...register("maxApiCalls")}
                />
              </div>
            </div>
          )}

          {/* FEATURE FLAGS */}
          {activeTab === "features" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
              {[
                { name: "emr", label: "Electronic Medical Records (EMR)" },
                { name: "appointments", label: "Patient Appointments" },
                { name: "billing", label: "Billing & Invoicing" },
                { name: "pharmacy", label: "Pharmacy Management" },
                { name: "inventory", label: "Inventory / Supplies" },
                { name: "laboratory", label: "Laboratory Integration" },
                { name: "radiology", label: "Radiology / PACS" },
                { name: "insurance", label: "Insurance Claims" },
                { name: "telemedicine", label: "Telemedicine / Virtual Visits" },
                { name: "notifications", label: "Email / SMS Alerts" },
                { name: "reports", label: "Analytics & Reports" },
              ].map((flag) => (
                <label
                  key={flag.name}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary mt-0.5"
                    {...register(flag.name as any)}
                  />
                  <span className="text-sm font-semibold text-foreground">{flag.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConfirmDialog>
  );
}
