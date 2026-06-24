"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuditLogs } from "../hooks/use-audit";
import { AuditLog } from "../types/audit.types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function AuditTable() {
  const { data: logs = [], isLoading } = useAuditLogs();

  const columns = [
    { header: "Event ID", accessor: (row: AuditLog) => <code className="text-xs font-mono text-muted-foreground">{row.id}</code> },
    { header: "Module", accessor: (row: AuditLog) => <span className="text-xs bg-muted px-2 py-1 rounded font-medium">{row.module}</span> },
    { header: "Action", accessor: (row: AuditLog) => <span className="font-semibold text-sm text-foreground">{row.action}</span> },
    { header: "Entity", accessor: (row: AuditLog) => <span className="text-sm">{row.entity}</span> },
    { header: "User", accessor: (row: AuditLog) => <span className="text-sm font-medium">{row.user}</span> },
    { header: "Timestamp", accessor: (row: AuditLog) => new Date(row.createdAt).toLocaleString() },
    { header: "Severity", accessor: (row: AuditLog) => <StatusBadge status={row.severity} /> },
    { header: "Status", accessor: (row: AuditLog) => <StatusBadge status={row.status} /> },
    { header: "Actions", accessor: () => <Button variant="ghost" size="icon" title="View Details"><Eye className="h-4 w-4" /></Button> },
  ];

  return <AppTable columns={columns} data={logs} isLoading={isLoading} />;
}
