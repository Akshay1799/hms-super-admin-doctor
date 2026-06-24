"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSecurityEvents } from "../hooks/use-audit";
import { SecurityEvent } from "../types/audit.types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function SecurityEventsTable() {
  const { data: events = [], isLoading } = useSecurityEvents();

  const columns = [
    { header: "Type", accessor: (row: SecurityEvent) => <span className="font-semibold text-sm text-foreground">{row.type}</span> },
    { header: "Severity", accessor: (row: SecurityEvent) => <StatusBadge status={row.severity} /> },
    { header: "User", accessor: (row: SecurityEvent) => <span className="text-sm font-medium">{row.user}</span> },
    { header: "IP Address", accessor: (row: SecurityEvent) => <code className="text-xs font-mono text-muted-foreground">{row.ipAddress}</code> },
    { header: "Timestamp", accessor: (row: SecurityEvent) => new Date(row.createdAt).toLocaleString() },
    { header: "Status", accessor: (row: SecurityEvent) => <StatusBadge status={row.status} /> },
    { header: "Actions", accessor: () => <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button> },
  ];

  return <AppTable columns={columns} data={events} isLoading={isLoading} />;
}
