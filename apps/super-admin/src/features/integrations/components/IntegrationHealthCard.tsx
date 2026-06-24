"use client";

import React from "react";
import { useIntegrationHealth } from "../hooks/use-integrations";
import { IntegrationHealthItem } from "../types/integrations.types";
import { CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  if (status === "active") return <CheckCircle2 className="h-5 w-5 text-success" />;
  if (status === "failed") return <XCircle className="h-5 w-5 text-destructive" />;
  return <AlertTriangle className="h-5 w-5 text-warning" />;
}

export function IntegrationHealthCard() {
  const { data: health = [], isLoading } = useIntegrationHealth();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {health.map((item: IntegrationHealthItem) => (
        <div
          key={item.service}
          className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
            item.status === "failed"
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-center gap-3">
            <StatusIcon status={item.status} />
            <div>
              <p className="text-sm font-medium text-foreground">{item.service}</p>
              <p className="text-xs text-muted-foreground">
                Last checked: {new Date(item.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xs text-muted-foreground">Latency</p>
              <p className={`text-sm font-semibold ${item.latencyMs > 1000 ? "text-destructive" : "text-foreground"}`}>
                {item.latencyMs > 999 ? "Timeout" : `${item.latencyMs}ms`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className={`text-sm font-semibold ${item.uptime >= 99 ? "text-success" : item.uptime >= 95 ? "text-warning" : "text-destructive"}`}>
                {item.uptime}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
