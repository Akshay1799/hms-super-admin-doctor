import React from "react";
import { TenantDetails } from "../../services/tenant.service";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { ClipboardList } from "lucide-react";

interface AuditLogsTabProps {
  details: TenantDetails;
}

export function AuditLogsTab({ details }: AuditLogsTabProps) {
  const { auditLogs } = details;

  // Map our TenantAuditLog structure to the ActivityTimeline component's events prop structure.
  const timelineEvents = auditLogs.map((log) => ({
    id: log.id,
    title: log.action,
    description: log.description,
    time: log.timestamp,
    type: (log.action.toLowerCase().includes("suspended") || log.action.toLowerCase().includes("delete")
      ? "destructive"
      : log.action.toLowerCase().includes("create")
      ? "success"
      : "info") as any,
  }));

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-foreground">Tenant Audit Trail</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          A chronological log of configuration modifications, subscription updates, and system activities.
        </p>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ClipboardList className="h-8 w-8 mb-2 text-muted-foreground/50" />
          <p className="text-sm font-semibold">No audits found</p>
          <p className="text-xs mt-0.5">No activities have been recorded for this tenant yet.</p>
        </div>
      ) : (
        <div className="pl-2">
          <ActivityTimeline events={timelineEvents} />
        </div>
      )}
    </div>
  );
}
