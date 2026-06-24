"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "../types/dashboard.types";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface AlertListProps {
  data?: Alert[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function AlertList({ data, isLoading, isError, onRetry }: AlertListProps) {
  if (isLoading) {
    return <LoadingSkeleton type="form" />;
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-[var(--radius-card)] p-6 text-center space-y-2">
        <p className="text-xs text-destructive font-semibold">Failed to load platform alerts.</p>
        <button
          onClick={onRetry}
          className="h-8 px-3 text-xs bg-destructive text-white rounded-[var(--radius-button)] font-semibold cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border p-6 rounded-[var(--radius-card)] text-center text-xs text-muted-foreground">
        No alerts found.
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <ShieldAlert className="h-4.5 w-4.5" />;
      case "warning":
        return <AlertTriangle className="h-4.5 w-4.5" />;
      default:
        return <Info className="h-4.5 w-4.5" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold">System Alerts</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Critical warnings and notifications requiring action.</p>
      </div>
      
      <div className="space-y-3">
        {data.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "p-3 rounded-lg border flex items-start gap-3",
              getSeverityStyle(alert.severity)
            )}
          >
            <div className="shrink-0 mt-0.5">{getIcon(alert.severity)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{alert.title}</p>
              <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{alert.description}</p>
            </div>
            <span className="text-[9px] opacity-60 font-semibold uppercase">{alert.createdAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
