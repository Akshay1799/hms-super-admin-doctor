"use client";

import React from "react";
import { ActivityTimeline as SharedTimeline } from "@/components/ui/activity-timeline";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Building2, Building, User, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { Activity } from "../types/dashboard.types";

interface ActivityTimelineProps {
  data?: Activity[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ActivityTimeline({ data, isLoading, isError, onRetry }: ActivityTimelineProps) {
  if (isLoading) {
    return <LoadingSkeleton type="form" />;
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-[var(--radius-card)] p-6 text-center space-y-2">
        <p className="text-xs text-destructive font-semibold">Failed to load platform activities.</p>
        <button
          onClick={onRetry}
          className="h-8 px-3 text-xs bg-destructive text-white rounded-[var(--radius-button)] font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border p-6 rounded-[var(--radius-card)] text-center text-xs text-muted-foreground">
        No activities available.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "Tenant Created":
        return <Building2 className="h-4 w-4" />;
      case "Hospital Added":
        return <Building className="h-4 w-4" />;
      case "Doctor Registered":
        return <User className="h-4 w-4" />;
      case "Invoice Generated":
        return <FileText className="h-4 w-4" />;
      case "Role Updated":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getType = (type: string) => {
    switch (type) {
      case "Tenant Created":
      case "Hospital Added":
        return "success";
      case "Invoice Generated":
        return "warning";
      case "Role Updated":
        return "destructive";
      default:
        return "info";
    }
  };

  const timelineEvents = data.map((item) => ({
    id: item.id,
    title: item.type,
    description: item.message,
    time: item.createdAt,
    icon: getIcon(item.type),
    type: getType(item.type) as any,
  }));

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold">Recent Activities</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time audit log of governance actions.</p>
      </div>
      <div className="pt-2">
        <SharedTimeline events={timelineEvents} />
      </div>
    </div>
  );
}
