"use client";

import React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { useReportStats } from "../hooks/use-reports";
import { FileBarChart, Clock, Download, DollarSign, ActivitySquare, ShieldCheck, FileSpreadsheet } from "lucide-react";

export function ReportStatsCards() {
  const { data: stats, isLoading } = useReportStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Total Reports" value={stats.totalReports} icon={FileBarChart} />
      <StatsCard title="Scheduled Reports" value={stats.scheduledReports} icon={Clock} />
      <StatsCard title="Exports Today" value={stats.exportsToday} icon={Download} trend={{ value: "+12% from yesterday", type: "up" }} />
      <StatsCard title="Revenue Reports" value={stats.revenueReports} icon={DollarSign} />
      <StatsCard title="Operational Reports" value={stats.operationalReports} icon={ActivitySquare} />
      <StatsCard title="Compliance Reports" value={stats.complianceReports} icon={ShieldCheck} />
      <StatsCard title="Custom Reports" value={stats.customReports} icon={FileSpreadsheet} />
    </div>
  );
}
