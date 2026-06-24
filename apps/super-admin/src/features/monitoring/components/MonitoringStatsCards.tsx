"use client";

import React from "react";
import { useMonitoringStats } from "../hooks/use-monitoring";
import { Server, CheckCircle, AlertTriangle, Layers, HardDrive, Zap, Bug, Activity } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";

export function MonitoringStatsCards() {
  const { data: stats, isLoading } = useMonitoringStats();

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
      <StatsCard title="Total Services" value={stats.totalServices} icon={Server} />
      <StatsCard
        title="Healthy Services"
        value={stats.healthyServices}
        icon={CheckCircle}
        trend={{ value: `${stats.healthyServices} of ${stats.totalServices}`, type: "up" }}
      />
      <StatsCard
        title="Critical Services"
        value={stats.criticalServices}
        icon={AlertTriangle}
        trend={{ value: stats.criticalServices > 0 ? "Needs attention" : "All clear", type: stats.criticalServices > 0 ? "down" : "up" }}
      />
      <StatsCard title="Queue Jobs" value={stats.queueJobs} icon={Layers} />
      <StatsCard
        title="Storage Used"
        value={`${stats.storageUsedPercent}%`}
        icon={HardDrive}
        trend={{ value: stats.storageUsedPercent > 80 ? "High usage" : "Normal", type: stats.storageUsedPercent > 80 ? "down" : "up" }}
      />
      <StatsCard title="Avg Response Time" value={`${stats.avgResponseTimeMs}ms`} icon={Zap} />
      <StatsCard
        title="Error Count"
        value={stats.errorCount}
        icon={Bug}
        trend={{ value: stats.errorCount > 10 ? "Review required" : "Low", type: stats.errorCount > 10 ? "down" : "up" }}
      />
      <StatsCard
        title="Platform Uptime"
        value={`${stats.uptimePercent}%`}
        icon={Activity}
        trend={{ value: "Last 7 days", type: "neutral" }}
      />
    </div>
  );
}
