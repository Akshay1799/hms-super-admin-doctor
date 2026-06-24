"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppTable } from "@/components/ui/app-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  useTenant,
  useUpdateFeatureFlags,
  useUpdateQuotas,
  useUpdateSubscription,
  useVerifyDomain,
} from "@/features/tenants/hooks/useTenants";
import { OverviewTab } from "@/features/tenants/components/details/OverviewTab";
import { QuotasTab } from "@/features/tenants/components/details/QuotasTab";
import { SubscriptionTab } from "@/features/tenants/components/details/SubscriptionTab";
import { DomainsTab } from "@/features/tenants/components/details/DomainsTab";
import { FeatureFlagsTab } from "@/features/tenants/components/details/FeatureFlagsTab";
import { AuditLogsTab } from "@/features/tenants/components/details/AuditLogsTab";
import { Building2, Users as UsersIcon, ShieldAlert } from "lucide-react";

type ActiveTab =
  | "overview"
  | "hospitals"
  | "users"
  | "subscription"
  | "domains"
  | "features"
  | "quotas"
  | "audits";

interface HospitalMock {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
}

interface UserMock {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const { data: details, isLoading, isError } = useTenant(id);

  // Mutations
  const updateFlagsMutation = useUpdateFeatureFlags(id);
  const updateQuotasMutation = useUpdateQuotas(id);
  const updateSubMutation = useUpdateSubscription(id);
  const verifyDomainMutation = useVerifyDomain(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading tenant details...</span>
        </div>
      </PageContainer>
    );
  }

  if (isError || !details) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Tenant Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The tenant you are looking for does not exist or has been deleted.
          </p>
        </div>
      </PageContainer>
    );
  }

  const { tenant } = details;

  // Mock Hospital Columns & Data
  const hospitalColumns: ColumnDef<HospitalMock>[] = [
    {
      accessorKey: "name",
      header: "Hospital Name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.original.name}</span>
      ),
    },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "location", header: "Location" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const mockHospitals: HospitalMock[] = [
    { id: "h-1", name: `${tenant.name} - General`, type: "General Hospital", location: "New York, USA", status: "Active" },
    { id: "h-2", name: `${tenant.name} - Cardio Care`, type: "Specialized Clinic", location: "Boston, USA", status: "Active" },
    { id: "h-3", name: `${tenant.name} - Diagnostics`, type: "Diagnostics Branch", location: "Chicago, USA", status: "Inactive" },
  ].slice(0, tenant.hospitalCount || 1);

  // Mock User Columns & Data
  const userColumns: ColumnDef<UserMock>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.original.name}</span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "System Role" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const mockUsers: UserMock[] = [
    { id: "u-1", name: "Alex Mercer", email: `admin@${tenant.code.toLowerCase()}.com`, role: "Tenant Admin", status: "Active" },
    { id: "u-2", name: "Sarah Connor", email: `sconnor@${tenant.code.toLowerCase()}.com`, role: "Branch Supervisor", status: "Active" },
    { id: "u-3", name: "Dr. Gregory House", email: `house@${tenant.code.toLowerCase()}.com`, role: "Clinician (Doctor)", status: "Active" },
  ];

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "hospitals", label: "Hospitals" },
    { id: "users", label: "Users" },
    { id: "subscription", label: "Subscription" },
    { id: "domains", label: "Domains" },
    { id: "features", label: "Feature Flags" },
    { id: "quotas", label: "Quota Usage" },
    { id: "audits", label: "Audit Logs" },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Tenants", href: "/tenants" },
          { label: tenant.name },
        ]}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title={tenant.name}
            description={`Code: ${tenant.code} | License: ${tenant.plan}`}
          />
          <div className="flex gap-2.5">
            <StatusBadge status={tenant.status} />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="mt-2 min-h-[400px]">
          {activeTab === "overview" && <OverviewTab details={details} />}

          {activeTab === "hospitals" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-foreground">Hospitals & Clinics</h2>
                  <p className="text-sm text-muted-foreground">List of hospitals registered under this tenant.</p>
                </div>
              </div>
              <AppTable
                columns={hospitalColumns}
                data={mockHospitals}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <p className="text-sm font-semibold">No hospitals onboarded</p>
                  </div>
                }
              />
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-foreground">Tenant Users</h2>
                  <p className="text-sm text-muted-foreground">Manage admin and medical staff users.</p>
                </div>
              </div>
              <AppTable
                columns={userColumns}
                data={mockUsers}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <UsersIcon className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <p className="text-sm font-semibold">No users registered</p>
                  </div>
                }
              />
            </div>
          )}

          {activeTab === "subscription" && (
            <SubscriptionTab
              details={details}
              onUpdateSubscription={(sub) => updateSubMutation.mutate(sub)}
              isUpdating={updateSubMutation.isPending}
            />
          )}

          {activeTab === "domains" && (
            <DomainsTab
              details={details}
              onVerifyDomain={() => verifyDomainMutation.mutate()}
              isVerifying={verifyDomainMutation.isPending}
            />
          )}

          {activeTab === "features" && (
            <FeatureFlagsTab
              details={details}
              onUpdateFlags={(flags) => updateFlagsMutation.mutate(flags)}
              isSaving={updateFlagsMutation.isPending}
            />
          )}

          {activeTab === "quotas" && (
            <QuotasTab
              details={details}
              onUpdateQuotas={(quotas) => updateQuotasMutation.mutate(quotas)}
              isUpdating={updateQuotasMutation.isPending}
            />
          )}

          {activeTab === "audits" && <AuditLogsTab details={details} />}
        </div>
      </div>
    </PageContainer>
  );
}
