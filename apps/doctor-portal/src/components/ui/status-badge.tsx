import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = "active" | "pending" | "suspended" | "inactive";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  const styles: Record<string, string> = {
    // success family
    active: "bg-success/10 text-success border-success/20",
    completed: "bg-success/10 text-success border-success/20",
    admitted: "bg-success/10 text-success border-success/20",
    paid: "bg-success/10 text-success border-success/20",
    approved: "bg-success/10 text-success border-success/20",
    delivered: "bg-success/10 text-success border-success/20",
    read: "bg-success/10 text-success border-success/20",
    sent: "bg-success/10 text-success border-success/20",
    success: "bg-success/10 text-success border-success/20",
    icu: "bg-destructive/10 text-destructive border-destructive/20",
    // warning family
    pending: "bg-warning/10 text-warning border-warning/20",
    rescheduled: "bg-warning/10 text-warning border-warning/20",
    trial: "bg-warning/10 text-warning border-warning/20",
    trialing: "bg-warning/10 text-warning border-warning/20",
    submitted: "bg-warning/10 text-warning border-warning/20",
    unpaid: "bg-warning/10 text-warning border-warning/20",
    scheduled: "bg-warning/10 text-warning border-warning/20",
    retrying: "bg-warning/10 text-warning border-warning/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    unread: "bg-primary/10 text-primary border-primary/20",
    info: "bg-primary/10 text-primary border-primary/20",
    "follow-up due": "bg-warning/10 text-warning border-warning/20",
    // destructive family
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    canceled: "bg-destructive/10 text-destructive border-destructive/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    past_due: "bg-destructive/10 text-destructive border-destructive/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    // neutral family
    inactive: "bg-muted text-muted-foreground border-border",
    discharged: "bg-muted text-muted-foreground border-border",
    draft: "bg-muted text-muted-foreground border-border",
    refunded: "bg-muted text-muted-foreground border-border",
    archived: "bg-muted text-muted-foreground border-border",
  };

  const currentStyle = styles[norm] || "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        currentStyle,
        className
      )}
      {...props}
    >
      {status}
    </span>
  );
}
