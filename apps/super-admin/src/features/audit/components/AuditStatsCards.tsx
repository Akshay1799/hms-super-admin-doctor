"use client";

import React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { useAuditStats } from "../hooks/use-audit";
import { Activity, ShieldAlert, LogIn, Database, Key, Users, Download, AlertTriangle } from "lucide-react";

export function AuditStatsCards() {
  const { data: stats, isLoading } = useAuditStats();

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
      <StatsCard title="Total Events" value={stats.totalEvents.toLocaleString()} icon={Activity} />
      <StatsCard title="Security Events" value={stats.securityEvents} icon={ShieldAlert} trend={{ value: "Last 30 days", type: "neutral" }} />
      <StatsCard title="Failed Logins" value={stats.failedLogins} icon={LogIn} trend={{ value: stats.failedLogins > 100 ? "High" : "Normal", type: stats.failedLogins > 100 ? "down" : "up" }} />
      <StatsCard title="Data Access Events" value={stats.dataAccessEvents.toLocaleString()} icon={Database} />
      <StatsCard title="Permission Changes" value={stats.permissionChanges} icon={Key} />
      <StatsCard title="Role Changes" value={stats.roleChanges} icon={Users} />
      <StatsCard title="Exports" value={stats.exports} icon={Download} />
      <StatsCard title="Compliance Violations" value={stats.complianceViolations} icon={AlertTriangle} trend={{ value: stats.complianceViolations > 0 ? "Requires Review" : "All Good", type: stats.complianceViolations > 0 ? "down" : "up" }} />
    </div>
  );
}
