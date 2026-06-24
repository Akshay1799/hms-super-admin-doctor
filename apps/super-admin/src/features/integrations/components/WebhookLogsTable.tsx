"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useWebhookLogs } from "../hooks/use-integrations";
import { WebhookLog } from "../types/integrations.types";

export function WebhookLogsTable() {
  const { data: logs = [], isLoading } = useWebhookLogs();

  const columns = [
    {
      header: "Event",
      accessor: (row: WebhookLog) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">{row.event}</code>
      ),
    },
    {
      header: "Response Code",
      accessor: (row: WebhookLog) => (
        <span className={`font-mono text-sm font-bold ${row.responseCode >= 200 && row.responseCode < 300 ? "text-success" : "text-destructive"}`}>
          {row.responseCode}
        </span>
      ),
    },
    { header: "Attempts", accessor: (row: WebhookLog) => row.attempts },
    { header: "Status", accessor: (row: WebhookLog) => <StatusBadge status={row.status} /> },
    { header: "Created At", accessor: (row: WebhookLog) => new Date(row.createdAt).toLocaleString() },
  ];

  return <AppTable columns={columns} data={logs} isLoading={isLoading} />;
}
