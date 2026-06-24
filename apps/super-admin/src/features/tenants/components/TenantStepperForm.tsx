import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenantSchema, CreateTenantInput } from "../schemas/tenant.schema";
import { FormField } from "@/components/ui/form-field";
import { Check, ArrowLeft, ArrowRight, Save, Globe, Cpu, BarChart2, Briefcase, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface TenantStepperFormProps {
  onSubmit: (data: CreateTenantInput) => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, name: "Organization", icon: Briefcase },
  { id: 2, name: "Contact", icon: Mail },
  { id: 3, name: "Plan & Billing", icon: Save },
  { id: 4, name: "Domain Setup", icon: Globe },
  { id: 5, name: "Feature Flags", icon: Cpu },
  { id: 6, name: "Resource Quotas", icon: BarChart2 },
];

export function TenantStepperForm({ onSubmit, isLoading = false }: TenantStepperFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      orgType: "Hospital Chain",
      email: "",
      phone: "",
      website: "",
      plan: "Professional",
      billingCycle: "Monthly",
      trialPeriod: 30,
      status: "Trial",
      primaryDomain: "",
      customDomain: "",
      sslEnabled: true,
      emr: true,
      appointments: true,
      billing: true,
      pharmacy: false,
      inventory: false,
      laboratory: false,
      radiology: false,
      insurance: false,
      telemedicine: false,
      notifications: true,
      reports: true,
      maxHospitals: 5,
      maxBranches: 10,
      maxDoctors: 50,
      maxStaff: 150,
      maxPatients: 5000,
      maxStorage: 500,
      maxApiCalls: 100000,
    },
  });

  const tenantName = watch("name");
  const tenantCode = watch("code");

  // Auto-generate code from name
  useEffect(() => {
    if (tenantName && currentStep === 1) {
      const generatedCode = tenantName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 10);
      setValue("code", generatedCode, { shouldValidate: true });
    }
  }, [tenantName, setValue, currentStep]);

  // Auto-generate primary domain from code
  useEffect(() => {
    if (tenantCode) {
      const domain = `${tenantCode.toLowerCase()}.medichain.com`;
      setValue("primaryDomain", domain, { shouldValidate: true });
    }
  }, [tenantCode, setValue]);

  const stepFields: Record<number, (keyof CreateTenantInput)[]> = {
    1: ["name", "code", "orgType"],
    2: ["email", "phone", "website"],
    3: ["plan", "billingCycle", "trialPeriod", "status"],
    4: ["primaryDomain", "customDomain", "sslEnabled"],
    5: [
      "emr",
      "appointments",
      "billing",
      "pharmacy",
      "inventory",
      "laboratory",
      "radiology",
      "insurance",
      "telemedicine",
      "notifications",
      "reports",
    ],
    6: [
      "maxHospitals",
      "maxBranches",
      "maxDoctors",
      "maxStaff",
      "maxPatients",
      "maxStorage",
      "maxApiCalls",
    ],
  };

  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit = (data: CreateTenantInput) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-8 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm">
      {/* Progress Header */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0 hidden md:block" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300 hidden md:block"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        <ul className="relative z-10 flex flex-col md:flex-row md:justify-between gap-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <li key={step.id} className="flex items-center gap-3 bg-card md:px-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "border-primary text-primary ring-4 ring-primary/10"
                      : "border-border text-muted-foreground bg-muted/30"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Step {step.id}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border pt-6" />

      {/* Form Content */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 min-h-[300px]">
        {/* STEP 1: ORGANIZATION DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Organization Details</h3>
            <p className="text-sm text-muted-foreground">Provide basic company details for the new tenant.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tenant Name"
                placeholder="e.g. Apollo Hospitals"
                id="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <FormField
                label="Tenant Code (Alphanumeric)"
                placeholder="e.g. APOLLO"
                id="code"
                error={errors.code?.message}
                {...register("code")}
              />
              <FormField
                label="Organization Type"
                id="orgType"
                as="select"
                error={errors.orgType?.message}
                {...register("orgType")}
              >
                <option value="Hospital Chain">Hospital Chain</option>
                <option value="Clinic">Clinic</option>
                <option value="Diagnostic Center">Diagnostic Center</option>
                <option value="Medical Group">Medical Group</option>
              </FormField>
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Contact Information</h3>
            <p className="text-sm text-muted-foreground">Primary administrative contact details for the tenant.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Primary Email Address"
                type="email"
                placeholder="admin@tenant.com"
                id="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormField
                label="Primary Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                id="phone"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Website URL (Optional)"
                  type="url"
                  placeholder="https://www.tenant.com"
                  id="website"
                  error={errors.website?.message}
                  {...register("website")}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PLAN AND BILLING */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Subscription Plan & Billing</h3>
            <p className="text-sm text-muted-foreground">Select the tier, billing period, and status for this organization.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Plan Tier"
                id="plan"
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
                id="billingCycle"
                as="select"
                error={errors.billingCycle?.message}
                {...register("billingCycle")}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </FormField>
              <FormField
                label="Trial Period (Days)"
                type="number"
                id="trialPeriod"
                error={errors.trialPeriod?.message}
                {...register("trialPeriod")}
              />
              <FormField
                label="Initial Account Status"
                id="status"
                as="select"
                error={errors.status?.message}
                {...register("status")}
              >
                <option value="Trial">Trial</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </FormField>
            </div>
          </div>
        )}

        {/* STEP 4: DOMAIN CONFIGURATION */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Domain Configuration</h3>
            <p className="text-sm text-muted-foreground">Define subdomains and custom domains.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Primary Subdomain"
                placeholder="tenant.medichain.com"
                id="primaryDomain"
                error={errors.primaryDomain?.message}
                {...register("primaryDomain")}
              />
              <FormField
                label="Custom Domain (Optional)"
                placeholder="portal.tenantdomain.com"
                id="customDomain"
                error={errors.customDomain?.message}
                {...register("customDomain")}
              />
              <div className="md:col-span-2 flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="sslEnabled"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  {...register("sslEnabled")}
                />
                <label htmlFor="sslEnabled" className="text-sm font-semibold text-foreground">
                  Enable Automatic SSL (HTTPS) provisioning
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: FEATURE FLAGS */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-foreground">Feature Flag Configuration</h3>
                <p className="text-sm text-muted-foreground">Enable or disable specific modules for this tenant.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
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
                  className="flex items-start gap-3 p-3.5 border border-border rounded-lg bg-card hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary mt-0.5"
                    {...register(flag.name as any)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{flag.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: RESOURCE LIMITS / QUOTAS */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-foreground">Resource Limits & Quotas</h3>
            <p className="text-sm text-muted-foreground">Set usage boundaries for this organization.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                label="Maximum Hospitals"
                type="number"
                id="maxHospitals"
                error={errors.maxHospitals?.message}
                {...register("maxHospitals")}
              />
              <FormField
                label="Maximum Branches"
                type="number"
                id="maxBranches"
                error={errors.maxBranches?.message}
                {...register("maxBranches")}
              />
              <FormField
                label="Maximum Doctors"
                type="number"
                id="maxDoctors"
                error={errors.maxDoctors?.message}
                {...register("maxDoctors")}
              />
              <FormField
                label="Maximum Staff Members"
                type="number"
                id="maxStaff"
                error={errors.maxStaff?.message}
                {...register("maxStaff")}
              />
              <FormField
                label="Maximum Active Patients"
                type="number"
                id="maxPatients"
                error={errors.maxPatients?.message}
                {...register("maxPatients")}
              />
              <FormField
                label="Maximum Storage (GB)"
                type="number"
                id="maxStorage"
                error={errors.maxStorage?.message}
                {...register("maxStorage")}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Monthly API Requests Quota"
                  type="number"
                  id="maxApiCalls"
                  error={errors.maxApiCalls?.message}
                  {...register("maxApiCalls")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
          <button
            type="button"
            onClick={currentStep === 1 ? () => router.push("/tenants") : handlePrev}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          {currentStep === STEPS.length ? (
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Create Tenant"}
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
