"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Activity,
  DollarSign,
  Building,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatsCard } from "@/components/ui/stats-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Drawer } from "@/components/ui/drawer";
import { FormField } from "@/components/ui/form-field";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { AppTable } from "@/components/ui/app-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { ColumnDef } from "@tanstack/react-table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock Chart Data
const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 5000 },
  { month: "Mar", revenue: 8000 },
  { month: "Apr", revenue: 7000 },
  { month: "May", revenue: 11000 },
  { month: "Jun", revenue: 15400 },
];

// Mock Table Data
interface TenantMock {
  id: string;
  name: string;
  plan: string;
  hospitals: number;
  status: string;
}

const mockTenants: TenantMock[] = [
  { id: "1", name: "Apollo Health Group", plan: "Enterprise Premium", hospitals: 14, status: "Active" },
  { id: "2", name: "CareFirst Clinics", plan: "Growth", hospitals: 3, status: "Pending" },
  { id: "3", name: "Sutter Regional Labs", plan: "Basic", hospitals: 1, status: "Inactive" },
  { id: "4", name: "Max Medical Solutions", plan: "Enterprise Premium", hospitals: 22, status: "Suspended" },
];

export default function DesignSystemPage() {
  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Table Page state
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const columns: ColumnDef<TenantMock>[] = [
    {
      accessorKey: "name",
      header: "Tenant Name",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={info.getValue() as string} size="sm" />
          <div>
            <p className="font-semibold text-foreground">{info.getValue() as string}</p>
            <p className="text-xs text-muted-foreground">ID: #{info.row.original.id}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan Type",
    },
    {
      accessorKey: "hospitals",
      header: "Hospitals Managed",
      cell: (info) => <span className="font-mono">{info.getValue() as number}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue() as string} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              toast.info(`Viewing details for ${info.row.original.name}`);
              setIsDrawerOpen(true);
            }}
            className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => {
              setIsDeleteOpen(true);
            }}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            title="Suspend / Delete"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const handleConfirmAction = () => {
    toast.success("Governance policy updated successfully.");
  };

  const handleDeleteAction = () => {
    toast.error("Tenant access has been suspended.");
  };

  return (
    <PageContainer>
      {/* Top Navigation Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Settings", href: "#" },
          { label: "Design System Showcase" },
        ]}
      />

      {/* Header Panel */}
      <PageHeader
        title="Design System & Core Library"
        description="Comprehensive showcase of standard layout, components, states, color HSL tokens, and visual standards."
        actions={
          <>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="h-10 px-4 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" /> Update Policy
            </button>
          </>
        }
      />

      {/* Spacing & Typography Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors & Typography */}
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold">Design Philosophy & Colors</h3>
            <p className="text-xs text-muted-foreground">Standardized theme palette tokens</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg p-3 bg-primary text-white text-xs font-semibold">
              Primary Blue
              <div className="text-[10px] opacity-80 mt-1 font-mono">#0F4C81</div>
            </div>
            <div className="rounded-lg p-3 bg-success text-white text-xs font-semibold">
              Success Green
              <div className="text-[10px] opacity-80 mt-1 font-mono">#16A34A</div>
            </div>
            <div className="rounded-lg p-3 bg-warning text-white text-xs font-semibold">
              Warning Amber
              <div className="text-[10px] opacity-80 mt-1 font-mono">#F59E0B</div>
            </div>
            <div className="rounded-lg p-3 bg-destructive text-white text-xs font-semibold">
              Error Red
              <div className="text-[10px] opacity-80 mt-1 font-mono">#DC2626</div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <h1 className="text-foreground">H1 Heading - 32px Bold</h1>
            <h2 className="text-foreground">H2 Heading - 28px Bold</h2>
            <h3 className="text-foreground">H3 Heading - 24px Semibold</h3>
            <h4 className="text-foreground">H4 Heading - 20px Semibold</h4>
            <h5 className="text-foreground">H5 Heading - 18px Medium</h5>
            <p className="text-foreground">Body Text - 14px Regular</p>
            <p className="caption text-muted-foreground">Caption Text - 12px Regular</p>
          </div>
        </div>

        {/* Form Controls & Toasts */}
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold">Forms & Toasts System</h3>
            <p className="text-xs text-muted-foreground">RHF and Zod standards with Sonner notifications</p>
          </div>

          <div className="space-y-4">
            <FormField
              id="name-input"
              label="Tenant Domain Name"
              placeholder="e.g. apollo-group"
              helperText="The unique sub-domain identifier for the tenant."
            />
            <FormField
              id="plan-select"
              label="License Plan Allocation"
              as="select"
            >
              <option value="basic">Basic Tier</option>
              <option value="growth">Growth Tier</option>
              <option value="enterprise">Enterprise Premium Tier</option>
            </FormField>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <button
              onClick={() => toast.success("Action completed successfully.")}
              className="h-9 px-3 rounded-lg border border-border text-xs font-medium bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Trigger Success Toast
            </button>
            <button
              onClick={() => toast.warning("Access key is expiring soon.")}
              className="h-9 px-3 rounded-lg border border-border text-xs font-medium bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Trigger Warning Toast
            </button>
            <button
              onClick={() => toast.error("Unable to create client tenant.")}
              className="h-9 px-3 rounded-lg border border-border text-xs font-medium bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Trigger Error Toast
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards & Data Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Registered Tenants"
          value="247"
          icon={Building}
          trend={{ value: "12%", type: "up" }}
          description="from last month"
        />
        <StatsCard
          title="Active System Operations"
          value="1,492"
          icon={Activity}
          trend={{ value: "0.8%", type: "down" }}
          description="live API requests"
        />
        <StatsCard
          title="Platform Monthly Revenue"
          value="$14,820"
          icon={DollarSign}
          trend={{ value: "18.4%", type: "up" }}
          description="accrued licenses"
        />
      </div>

      {/* ChartCard Demonstration */}
      <div className="grid grid-cols-1">
        <ChartCard
          title="Licensing Revenue Progress"
          description="Monthly aggregated platform subscription revenue"
          actions={
            <span className="text-xs font-semibold text-primary uppercase">
              Live Chart Card
            </span>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius-card)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Table & Filtering Showcase */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Standard Data Table Layout</h3>
        <FilterBar
          searchSlot={
            <SearchInput
              placeholder="Search active tenants..."
              value={searchQuery}
              onSearch={setSearchQuery}
            />
          }
          dropdowns={[
            {
              name: "plan",
              placeholder: "Filter by Plan",
              selectedValue: filterValue,
              onChange: setFilterValue,
              options: [
                { label: "Enterprise Premium", value: "Enterprise Premium" },
                { label: "Growth", value: "Growth" },
                { label: "Basic", value: "Basic" },
              ],
            },
          ]}
          actionSlot={
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="h-10 px-4 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Add Tenant
            </button>
          }
        />

        <AppTable
          columns={columns}
          data={mockTenants.filter(
            (t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
              (filterValue === "" || t.plan === filterValue)
          )}
        />
        <Pagination
          meta={{ page, limit: 10, total: 4 }}
          onPageChange={setPage}
        />
      </div>

      {/* Feedback / Loading / Empty States Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wide">
            Empty State Pattern
          </p>
          <EmptyState
            title="No Branches Found"
            description="Create your first hospital branch to assign clinical departments and doctors."
            actionLabel="Add First Branch"
            onAction={() => toast.info("Branch addition triggered")}
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wide">
            Error State Pattern (Forbidden)
          </p>
          <ErrorState
            type="forbidden"
            message="Your account lacks the permissions to configure platform billing endpoints."
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wide">
            Loading Skeleton Pattern
          </p>
          <LoadingSkeleton type="chart" />
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Apply Platform Security Policy?"
        description="This will instantly deploy the new multi-tenant rate-limiting rules across all hospitals."
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAction}
        itemName="Max Medical Solutions (ID: #4)"
        title="Suspend Tenant Operations?"
        description="Are you sure you want to suspend this tenant? All clinical access and active sessions will be terminated immediately."
      />

      {/* Right Drawer for Quick View / Forms */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Tenant Summary Details"
        description="Detailed review of active licenses and audit events for the selected tenant."
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar fallback="Apollo Health Group" size="lg" />
            <div>
              <h4 className="text-base font-bold text-foreground">Apollo Health Group</h4>
              <p className="text-xs text-muted-foreground font-mono">Lic. Key: hms_ap_9281_x</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Admin Status</p>
              <StatusBadge status="Active" className="mt-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan Allocation</p>
              <p className="text-sm font-semibold mt-1">Enterprise Premium</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Recent Tenant Logs
            </p>
            <ActivityTimeline
              events={[
                {
                  id: "evt-1",
                  title: "Clinical Hospital Created",
                  description: "Branch 'East Apollo Delhi' successfully initialized.",
                  time: "10 mins ago",
                  icon: <CheckCircle2 className="h-4.5 w-4.5 text-success" />,
                  type: "success",
                },
                {
                  id: "evt-2",
                  title: "License Plan Upgraded",
                  description: "Tenant plan bumped from Growth to Enterprise Premium.",
                  time: "2 hours ago",
                  icon: <Activity className="h-4.5 w-4.5 text-primary" />,
                  type: "info",
                },
              ]}
            />
          </div>
        </div>
      </Drawer>
    </PageContainer>
  );
}
