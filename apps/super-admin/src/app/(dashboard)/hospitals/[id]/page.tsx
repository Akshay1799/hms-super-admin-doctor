"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppTable } from "@/components/ui/app-table";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useHospital,
  useUpdateCapacity,
  useUpdateAccreditation,
  useUpdateSettings,
  useSuspendHospital,
  useActivateHospital,
  useDeleteHospital,
} from "@/features/hospitals/hooks/useHospitals";
import { OverviewTab } from "@/features/hospitals/components/details/OverviewTab";
import { BranchesTab } from "@/features/hospitals/components/details/BranchesTab";
import { DepartmentsTab } from "@/features/hospitals/components/details/DepartmentsTab";
import { CapacityTab } from "@/features/hospitals/components/details/CapacityTab";
import { AccreditationTab } from "@/features/hospitals/components/details/AccreditationTab";
import { SettingsTab } from "@/features/hospitals/components/details/SettingsTab";
import { AuditLogsTab } from "@/features/hospitals/components/details/AuditLogsTab";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Stethoscope, Users, ShieldAlert } from "lucide-react";

type ActiveTab =
  | "overview"
  | "branches"
  | "departments"
  | "doctors"
  | "patients"
  | "capacity"
  | "accreditation"
  | "settings"
  | "audits";

interface DoctorMock {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  status: string;
}

interface PatientMock {
  id: string;
  name: string;
  gender: string;
  status: string;
  admissionDate: string;
}

import { useAuthStore } from "@/store/auth.store";

import { apiClient } from "@/lib/api-client";

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as ActiveTab;

  const { user } = useAuthStore();
  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  const [activeTab, setActiveTab] = useState<ActiveTab>(queryTab || "overview");
  const [staffRoleFilter, setStaffRoleFilter] = useState("ALL");

  const [realPatients, setRealPatients] = useState<any[]>([]);
  const [realStaff, setRealStaff] = useState<any[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoadingPatients(true);
    apiClient.get('/patients', { params: { hospitalId: id, limit: 100 } })
      .then((res) => setRealPatients(res.data.data || []))
      .catch((err) => console.error('Failed to load hospital patients:', err))
      .finally(() => setIsLoadingPatients(false));

    setIsLoadingStaff(true);
    apiClient.get('/users', { params: { hospitalId: id, limit: 100 } })
      .then((res) => setRealStaff(res.data.data || []))
      .catch((err) => console.error('Failed to load hospital staff:', err))
      .finally(() => setIsLoadingStaff(false));
  }, [id]);

  // Dialog triggers
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Query details
  const { data: details, isLoading, isError } = useHospital(id);

  // Mutations
  const updateCapacityMutation = useUpdateCapacity(id);
  const updateAccreditationMutation = useUpdateAccreditation(id);
  const updateSettingsMutation = useUpdateSettings(id);
  const suspendMutation = useSuspendHospital();
  const activateMutation = useActivateHospital();
  const deleteMutation = useDeleteHospital();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading hospital configurations...</span>
        </div>
      </PageContainer>
    );
  }

  if (isError || !details) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Hospital Node Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The hospital unit you requested does not exist or has been deleted from this tenant.
          </p>
        </div>
      </PageContainer>
    );
  }

  const { hospital } = details;

  // Real Patients Columns & Data
  const patientColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => {
        const p = row.original;
        const fullName = `${p.name || ''} ${p.lastName || ''}`.trim() || 'Indian Patient';
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">{fullName}</span>
            {p.uhid && <span className="text-xs text-muted-foreground font-mono">{p.uhid}</span>}
          </div>
        );
      },
    },
    { accessorKey: "gender", header: "Gender" },
    {
      accessorKey: "phone",
      header: "Contact Phone",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.phone || 'N/A'}</span>,
    },
    {
      accessorKey: "admissionDate",
      header: "Admission / Reg. Date",
      cell: ({ row }) => {
        const d = row.original.admissionDate || row.original.createdAt;
        return <span className="font-mono text-xs">{d ? new Date(d).toLocaleDateString('en-IN') : 'N/A'}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status || 'Active'} />,
    },
  ];

  const filteredStaff = staffRoleFilter === "ALL" 
    ? realStaff 
    : realStaff.filter(s => s.role === staffRoleFilter);

  const staffColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Staff Member Name",
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "role",
      header: "Assigned Role",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
          {(row.original.role || 'STAFF').replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "specialty",
      header: "Specialty / Unit",
      cell: ({ row }) => <span>{row.original.specialty || row.original.departmentId?.name || "Clinical Unit"}</span>,
    },
    { accessorKey: "email", header: "Email Address" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status || 'Active'} />,
    },
  ];

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "departments", label: "Departments" },
    { id: "doctors", label: "Staff & Clinicians" },
    { id: "patients", label: "Patients" },
    { id: "capacity", label: "Capacity" },
    { id: "accreditation", label: "Accreditation" },
    { id: "settings", label: "Settings" },
    { id: "audits", label: "Audit Logs" },
  ];

  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    router.replace(`/hospitals/${id}?tab=${tabId}`);
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: hospital.name },
        ]}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title={hospital.name}
            description={`Code: ${hospital.code} | Type: ${hospital.type}`}
          />
          <div className="flex gap-2">
            <StatusBadge status={hospital.status === "Under Review" ? "pending" : hospital.status} />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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

        {/* Tab content rendering */}
        <div className="mt-2 min-h-[400px]">
          {activeTab === "overview" && <OverviewTab details={details} />}

          {activeTab === "branches" && <BranchesTab details={details} />}

          {activeTab === "departments" && <DepartmentsTab details={details} />}

          {activeTab === "doctors" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
                <div>
                  <h2 className="text-base font-bold text-foreground">Hospital Medical Staff & Staff Directory</h2>
                  <p className="text-xs text-muted-foreground">Clinicians, nurses, pharmacists, receptionists, and lab technicians assigned to this unit.</p>
                </div>

                {/* Role Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Filter by Role:</label>
                  <select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="ALL">All Roles ({realStaff.length})</option>
                    <option value="DOCTOR">Doctors / Clinicians</option>
                    <option value="NURSE">Nurses</option>
                    <option value="PHARMACIST">Pharmacists</option>
                    <option value="RECEPTIONIST">Receptionists</option>
                    <option value="STAFF">Staff / Operations</option>
                  </select>
                </div>
              </div>

              <AppTable
                columns={staffColumns}
                data={filteredStaff}
                isLoading={isLoadingStaff}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Stethoscope className="h-8 w-8 mb-2 text-muted-foreground/45" />
                    <p className="text-sm font-semibold">No staff found for selected role filter</p>
                  </div>
                }
              />
            </div>
          )}

          {activeTab === "patients" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-foreground">Active Outpatients & Admissions ({realPatients.length})</h2>
                <p className="text-sm text-muted-foreground">Patients registered under this hospital unit.</p>
              </div>
              <AppTable
                columns={patientColumns}
                data={realPatients}
                isLoading={isLoadingPatients}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2 text-muted-foreground/45" />
                    <p className="text-sm font-semibold">No patients registered for this hospital</p>
                  </div>
                }
              />
            </div>
          )}

          {activeTab === "capacity" && <CapacityTab details={details} />}

          {activeTab === "accreditation" && <AccreditationTab details={details} />}

          {activeTab === "settings" && (
            <SettingsTab
              details={details}
              isSaving={updateSettingsMutation.isPending}
              onUpdateSettings={(settings) => updateSettingsMutation.mutate(settings)}
              onSuspend={() => setIsSuspendOpen(true)}
              onActivate={() => setIsActivateOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
            />
          )}

          {activeTab === "audits" && <AuditLogsTab details={details} />}
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      {isSuspendOpen && (
        <ConfirmDialog
          isOpen={isSuspendOpen}
          onClose={() => setIsSuspendOpen(false)}
          onConfirm={() => {
            suspendMutation.mutate(hospital.id, {
              onSuccess: () => setIsSuspendOpen(false),
            });
          }}
          title="Suspend Hospital Operations"
          description={`Are you sure you want to suspend "${hospital.name}"? This blocks logins for doctors and staff within this unit.`}
          confirmText={suspendMutation.isPending ? "Suspending..." : "Suspend"}
          cancelText="Cancel"
          type="destructive"
        />
      )}

      {/* Activate Confirmation Dialog */}
      {isActivateOpen && (
        <ConfirmDialog
          isOpen={isActivateOpen}
          onClose={() => setIsActivateOpen(false)}
          onConfirm={() => {
            activateMutation.mutate(hospital.id, {
              onSuccess: () => setIsActivateOpen(false),
            });
          }}
          title="Activate Hospital Operations"
          description={`Are you sure you want to activate "${hospital.name}"? This restores login capabilities for all staff.`}
          confirmText={activateMutation.isPending ? "Activating..." : "Activate"}
          cancelText="Cancel"
          type="info"
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            deleteMutation.mutate(hospital.id, {
              onSuccess: () => {
                setIsDeleteOpen(false);
                router.push("/hospitals");
              },
            });
          }}
          title="Delete Hospital Node"
          description="WARNING: Deleting this hospital will permanently remove all nested branches, outpatient wings, departments, and capacity configurations."
          confirmText={deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
          cancelText="Cancel"
          type="destructive"
        />
      )}
    </PageContainer>
  );
}
