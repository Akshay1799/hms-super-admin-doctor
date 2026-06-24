"use client";

import React from "react";
import { useSystemHealth } from "../hooks/use-monitoring";
import { ServiceHealth, HealthStatus } from "../types/monitoring.types";
import { CheckCircle2, XCircle, AlertTriangle, WifiOff } from "lucide-react";

function HealthDot({ status }: { status: HealthStatus }) {
  if (status === "healthy") return <CheckCircle2 className="h-5 w-5 text-success" />;
  if (status === "warning") return <AlertTriangle className="h-5 w-5 text-warning" />;
  if (status === "critical") return <XCircle className="h-5 w-5 text-destructive" />;
  return <WifiOff className="h-5 w-5 text-muted-foreground" />;
}

function LatencyBar({ ms }: { ms: number }) {
  const max = 3000;
  const pct = Math.min((ms / max) * 100, 100);
  const color = ms < 200 ? "bg-success" : ms < 600 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-mono font-medium ${ms < 200 ? "text-success" : ms < 600 ? "text-warning" : "text-destructive"}`}>
        {ms}ms
      </span>
    </div>
  );
}

export function HealthCard() {
  const { data: services = [], isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((svc: ServiceHealth) => (
        <div
          key={svc.id}
          className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
            svc.status === "critical"
              ? "border-destructive/30 bg-destructive/5"
              : svc.status === "warning"
              ? "border-warning/30 bg-warning/5"
              : "border-border bg-card"
          }`}
        >
          <HealthDot status={svc.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-foreground">{svc.service}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">v{svc.version}</span>
                <span>{svc.uptime}% uptime</span>
              </div>
            </div>
            <LatencyBar ms={svc.responseTime} />
          </div>
        </div>
      ))}
    </div>
  );
}
