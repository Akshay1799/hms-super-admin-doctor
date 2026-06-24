"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAccessHistory } from "../hooks/use-audit";
import { AccessHistory } from "../types/audit.types";

export function AccessHistoryTable() {
  const { data: history = [], isLoading } = useAccessHistory();

  const columns = [
    { header: "User", accessor: (row: AccessHistory) => <span className="font-semibold text-sm text-foreground">{row.user}</span> },
    { header: "Role", accessor: (row: AccessHistory) => <span className="text-sm bg-muted px-2 py-1 rounded">{row.role}</span> },
    { header: "IP Address", accessor: (row: AccessHistory) => <code className="text-xs font-mono text-muted-foreground">{row.ipAddress}</code> },
    { header: "Device", accessor: (row: AccessHistory) => <span className="text-sm text-muted-foreground">{row.browser} on {row.os}</span> },
    { header: "Location", accessor: (row: AccessHistory) => <span className="text-sm">{row.country}</span> },
    { header: "Login", accessor: (row: AccessHistory) => new Date(row.loginTime).toLocaleString() },
    { header: "Logout", accessor: (row: AccessHistory) => row.logoutTime ? new Date(row.logoutTime).toLocaleString() : "Active" },
    { header: "Status", accessor: (row: AccessHistory) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={history} isLoading={isLoading} />;
}
