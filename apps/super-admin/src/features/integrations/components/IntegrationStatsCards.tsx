"use client";

import React from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { useIntegrationStats } from "../hooks/use-integrations";
import { Link2, CheckCircle, XCircle, Zap, Webhook, HardDrive } from "lucide-react";

export function IntegrationStatsCards() {
  const { data: stats, isLoading } = useIntegrationStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard title="Connected Integrations" value={stats.connectedIntegrations} icon={Link2} />
      <StatsCard title="Active Integrations" value={stats.activeIntegrations} icon={CheckCircle} trend={{ value: `${stats.activeIntegrations} of ${stats.connectedIntegrations}`, type: "up" }} />
      <StatsCard title="Failed Integrations" value={stats.failedIntegrations} icon={XCircle} trend={{ value: `${stats.failedIntegrations} need attention`, type: "down" }} />
      <StatsCard title="API Calls Today" value={stats.apiCallsToday.toLocaleString()} icon={Zap} />
      <StatsCard title="Webhook Events" value={stats.webhookEvents} icon={Webhook} />
      <StatsCard title="Storage Providers" value={stats.storageProviders} icon={HardDrive} />
    </div>
  );
}
