"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/features/dashboard/components/RevenueChart").then(m => m.RevenueChart), { ssr: false });
const BedOccupancyChart = dynamic(() => import("@/features/dashboard/components/BedOccupancyChart").then(m => m.BedOccupancyChart), { ssr: false });
const DepartmentRevenueChart = dynamic(() => import("@/features/dashboard/components/DepartmentRevenueChart").then(m => m.DepartmentRevenueChart), { ssr: false });

import { TopHospitalsTable } from "@/features/dashboard/components/TopHospitalsTable";
import { ActivityTimeline } from "@/features/dashboard/components/ActivityTimeline";
import { AlertList } from "@/features/dashboard/components/AlertList";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics";
import { useRevenueTrend } from "@/features/dashboard/hooks/useRevenueTrend";
import { useActivities } from "@/features/dashboard/hooks/useActivities";
import { useAlerts } from "@/features/dashboard/hooks/useAlerts";
import { toast } from "sonner";
import { RefreshCw, Download } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  const [filters, setFilters] = React.useState({
    dateRange: "last-30",
    status: "all",
    tenant: "",
  });

  // Load isolated query loaders
  const { data: rawMetrics, isLoading: mLoading, isError: mError, refetch: mRefetch } = useDashboardMetrics();
  const { data: revTrend, isLoading: rLoading, isError: rError, refetch: rRefetch } = useRevenueTrend();
  const { data: activities, isLoading: actLoading, isError: actError, refetch: actRefetch } = useActivities();
  const { data: alerts, isLoading: alLoading, isError: alError, refetch: alRefetch } = useAlerts();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success("Synchronizing dashboard widgets...");
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    toast.success(`Filters updated: ${newFilters.dateRange} · ${newFilters.status} ${newFilters.tenant ? `· "${newFilters.tenant}"` : ""}`);
  };

  const handleExport = (format: "csv" | "pdf") => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Exporting dashboard report as ${format.toUpperCase()}...`,
        success: `Report successfully downloaded as ${format.toUpperCase()}.`,
        error: "Export failed.",
      }
    );
  };

  // Role-tailored KPI metrics customization
  const baseMetrics = isTenantAdmin
    ? [
        { id: "tkpi-1", title: "Hospital Branches", value: "4 Units", percentage: 5.2, trend: "up", color: "blue", icon: "Building" },
        { id: "tkpi-2", title: "Active Doctors", value: "57 Specialists", percentage: 8.4, trend: "up", color: "purple", icon: "User" },
        { id: "tkpi-3", title: "Registered Patients", value: "1,540 Patients", percentage: 12.1, trend: "up", color: "teal", icon: "Users2" },
        { id: "tkpi-4", title: "Bed Occupancy Rate", value: "78.5%", percentage: 3.2, trend: "up", color: "emerald", icon: "Bed" },
        { id: "tkpi-5", title: "Monthly Organization Revenue", value: "₹48.2L", percentage: 14.2, trend: "up", color: "emerald", icon: "IndianRupee" },
        { id: "tkpi-6", title: "Pending Consultations", value: "24 OPD", percentage: 2.1, trend: "down", color: "orange", icon: "Calendar" },
        { id: "tkpi-7", title: "Staff Shift Rosters", value: "98% Filled", percentage: 0, trend: "neutral", color: "gray", icon: "ClipboardList" },
        { id: "tkpi-8", title: "Unpaid Invoices", value: "₹2.4L", percentage: 1.5, trend: "down", color: "red", icon: "Receipt" },
      ]
    : rawMetrics;

  const filteredMetrics = baseMetrics?.map(kpi => {
    let multiplier = 1.0;
    if (filters.dateRange === "today") multiplier = 0.05;
    else if (filters.dateRange === "last-7") multiplier = 0.25;
    else if (filters.dateRange === "last-90") multiplier = 2.8;

    if (filters.status !== "all") multiplier *= 0.6;
    if (filters.tenant && !isTenantAdmin) multiplier *= 0.15;

    const originalValue = typeof kpi.value === "string" ? parseFloat(kpi.value.replace(/[^0-9.]/g, '')) : kpi.value;
    const computed = Math.round(originalValue * multiplier);
    
    return {
      ...kpi,
      value: typeof kpi.value === "string" && !kpi.value.includes("%") && !kpi.value.includes("Units") && !kpi.value.includes("Specialists") && !kpi.value.includes("Patients") && !kpi.value.includes("OPD") && !kpi.value.includes("Filled")
        ? (kpi.value.includes("₹") || kpi.value.includes("$") ? `₹${computed.toLocaleString()}L` : computed.toLocaleString())
        : kpi.value
    };
  });

  return (
    <PageContainer>
      {/* Top Breadcrumb */}
      <Breadcrumbs items={[{ label: isTenantAdmin ? "Tenant Organization Overview" : "Governance Master Overview" }]} />

      {/* Main Header Panel */}
      <PageHeader
        title={isTenantAdmin ? "Apollo Clinics Executive Dashboard" : "HMS SaaS Master Dashboard"}
        description={isTenantAdmin ? "Organization performance, branch occupancy, and doctor roster metrics." : "Platform insights, SaaS tenant subscriptions, and global infrastructure health."}
        actions={
          <div className="flex gap-2.5">
            <button
              onClick={() => handleExport("csv")}
              className="h-10 px-3.5 rounded-[var(--radius-button)] border border-border text-sm font-semibold hover:bg-muted text-foreground transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" /> Export Report
            </button>
            <button
              onClick={handleRefresh}
              className="h-10 px-3.5 rounded-[var(--radius-button)] border border-border text-sm font-semibold hover:bg-muted text-foreground transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4.5 w-4.5" /> Refresh Dashboard
            </button>
          </div>
        }
      />

      {/* Filters Toolbar */}
      <DashboardFilters onFiltersChange={handleFiltersChange} />

      {/* KPI Cards Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredMetrics ? (
          filteredMetrics.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              isLoading={mLoading}
              isError={mError}
              onRetry={mRefetch}
            />
          ))
        ) : (
          Array.from({ length: 8 }).map((_, idx) => (
            <KpiCard key={idx} isLoading={true} />
          ))
        )}
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revTrend}
            isLoading={rLoading}
            isError={rError}
            onRetry={rRefetch}
          />
        </div>
        <div>
          <BedOccupancyChart />
        </div>
      </div>

      {/* Secondary Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <DepartmentRevenueChart />
        </div>
        <div className="lg:col-span-2">
          <TopHospitalsTable />
        </div>
      </div>

      {/* Timelines and Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <AlertList
            data={alerts}
            isLoading={alLoading}
            isError={alError}
            onRetry={alRefetch}
          />
        </div>
        <div>
          <ActivityTimeline
            data={activities}
            isLoading={actLoading}
            isError={actError}
            onRetry={actRefetch}
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </PageContainer>
  );
}
