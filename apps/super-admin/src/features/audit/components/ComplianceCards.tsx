"use client";

import React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { useComplianceStats } from "../hooks/use-audit";
import { ShieldCheck, Eye, Download, Key, AlertOctagon, Archive } from "lucide-react";

export function ComplianceCards() {
  const { data: stats, isLoading } = useComplianceStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard title="HIPAA Events" value={stats.hipaaEvents.toLocaleString()} icon={ShieldCheck} />
      <StatsCard title="PHI Access Logs" value={stats.phiAccess.toLocaleString()} icon={Eye} />
      <StatsCard title="Export Events" value={stats.exportEvents.toLocaleString()} icon={Download} />
      <StatsCard title="Sensitive Operations" value={stats.sensitiveOperations.toLocaleString()} icon={Key} />
      <StatsCard title="Security Violations" value={stats.securityViolations} icon={AlertOctagon} trend={{ value: "Needs review", type: "down" }} />
      <StatsCard title="Retention Compliance" value={`${stats.retentionCompliance}%`} icon={Archive} trend={{ value: "Target: 100%", type: "neutral" }} />
    </div>
  );
}
