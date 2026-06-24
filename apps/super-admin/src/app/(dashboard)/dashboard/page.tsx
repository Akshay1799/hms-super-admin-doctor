"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { BedOccupancyChart } from "@/features/dashboard/components/BedOccupancyChart";
import { DepartmentRevenueChart } from "@/features/dashboard/components/DepartmentRevenueChart";
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

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Load isolated query loaders
  const { data: metrics, isLoading: mLoading, isError: mError, refetch: mRefetch } = useDashboardMetrics();
  const { data: revTrend, isLoading: rLoading, isError: rError, refetch: rRefetch } = useRevenueTrend();
  const { data: activities, isLoading: actLoading, isError: actError, refetch: actRefetch } = useActivities();
  const { data: alerts, isLoading: alLoading, isError: alError, refetch: alRefetch } = useAlerts();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success("Synchronizing dashboard widgets...");
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

  return (
    <PageContainer>
      {/* Top Breadcrumb */}
      <Breadcrumbs items={[{ label: "Governance Overview" }]} />

      {/* Main Header Panel */}
      <PageHeader
        title="Dashboard"
        description="Platform insights and analytics overview."
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
      <DashboardFilters />

      {/* KPI Cards Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {metrics ? (
          metrics.map((kpi) => (
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
