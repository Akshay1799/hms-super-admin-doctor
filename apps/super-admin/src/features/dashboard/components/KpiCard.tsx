"use client";

import React from "react";
import * as Icons from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface KpiCardProps {
  kpi?: any;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function KpiCard({ kpi, isLoading, isError, onRetry }: KpiCardProps) {
  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-[var(--radius-card)] p-4 text-center space-y-2.5">
        <p className="text-xs text-destructive font-semibold">Failed to load metric.</p>
        <button
          onClick={onRetry}
          className="h-8 px-3 text-xs bg-destructive text-white rounded-[var(--radius-button)] font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!kpi) return null;

  // Resolve Lucide Icon dynamically
  const IconComponent = (Icons as any)[kpi.icon] || Icons.HelpCircle;

  return (
    <StatsCard
      title={kpi.title}
      value={kpi.value}
      icon={IconComponent}
      trend={kpi.percentage > 0 ? { value: `${kpi.percentage}%`, type: kpi.trend } : undefined}
      description={kpi.percentage > 0 ? "vs prev month" : undefined}
    />
  );
}
