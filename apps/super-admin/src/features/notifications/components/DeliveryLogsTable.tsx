"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDeliveryLogs } from "../hooks/useNotifications";
import { DeliveryLog } from "../types/notifications.types";
import { AlertCircle } from "lucide-react";

export function DeliveryLogsTable() {
  const { data: logs = [], isLoading } = useDeliveryLogs();

  const columns = [
    {
      header: "Log ID",
      accessor: (row: DeliveryLog) => <span className="font-medium text-foreground font-mono text-xs">{row.id}</span>,
    },
    {
      header: "Recipient",
      accessor: (row: DeliveryLog) => (
        <div>
          <p className="font-medium text-sm text-foreground">{row.recipient}</p>
          <p className="text-xs text-muted-foreground">{row.recipientEmail}</p>
        </div>
      ),
    },
    { header: "Channel", accessor: (row: DeliveryLog) => <StatusBadge status={row.channel} /> },
    { header: "Status", accessor: (row: DeliveryLog) => <StatusBadge status={row.status} /> },
    {
      header: "Delivered At",
      accessor: (row: DeliveryLog) =>
        row.deliveredAt ? new Date(row.deliveredAt).toLocaleString() : "—",
    },
    {
      header: "Read At",
      accessor: (row: DeliveryLog) => (row.readAt ? new Date(row.readAt).toLocaleString() : "—"),
    },
    {
      header: "Retries",
      accessor: (row: DeliveryLog) => (
        <span className={`font-medium text-sm ${row.retries > 0 ? "text-warning" : "text-muted-foreground"}`}>
          {row.retries}
        </span>
      ),
    },
    {
      header: "Error",
      accessor: (row: DeliveryLog) =>
        row.errorMessage ? (
          <div className="flex items-center gap-1 text-destructive text-xs max-w-[180px]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{row.errorMessage}</span>
          </div>
        ) : null,
    },
  ];

  return <AppTable columns={columns} data={logs} isLoading={isLoading} />;
}
