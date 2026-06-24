"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useErrors } from "../hooks/use-monitoring";
import { ErrorLog } from "../types/monitoring.types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, EyeOff, Eye } from "lucide-react";

export function ErrorTable() {
  const { data: errors = [], isLoading } = useErrors();

  const severityOrder: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 };
  const sorted = [...errors].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  const columns = [
    { header: "Error ID", accessor: (row: ErrorLog) => (
      <code className="text-xs font-mono text-muted-foreground">{row.id}</code>
    )},
    { header: "Service", accessor: (row: ErrorLog) => <span className="font-medium text-foreground text-sm">{row.service}</span> },
    { header: "Severity", accessor: (row: ErrorLog) => <StatusBadge status={row.severity} /> },
    {
      header: "Message",
      accessor: (row: ErrorLog) => (
        <span className="text-sm text-muted-foreground truncate max-w-[280px] block" title={row.message}>
          {row.message}
        </span>
      ),
    },
    {
      header: "Occurrences",
      accessor: (row: ErrorLog) => (
        <span className={`font-mono text-sm font-bold ${row.occurrences > 10 ? "text-destructive" : row.occurrences > 3 ? "text-warning" : "text-foreground"}`}>
          {row.occurrences}
        </span>
      ),
    },
    { header: "Created At", accessor: (row: ErrorLog) => new Date(row.createdAt).toLocaleString() },
    { header: "Status", accessor: (row: ErrorLog) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: (row: ErrorLog) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
          {row.status === "open" && (
            <Button variant="ghost" size="icon" title="Resolve"><CheckCircle2 className="h-4 w-4 text-success" /></Button>
          )}
          {row.status !== "ignored" && (
            <Button variant="ghost" size="icon" title="Ignore"><EyeOff className="h-4 w-4 text-muted-foreground" /></Button>
          )}
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={sorted} isLoading={isLoading} />;
}
