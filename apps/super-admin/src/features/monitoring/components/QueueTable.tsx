"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useQueues } from "../hooks/use-monitoring";
import { QueueMetric } from "../types/monitoring.types";

export function QueueTable() {
  const { data: queues = [], isLoading } = useQueues();

  const columns = [
    { header: "Queue Name", accessor: (row: QueueMetric) => <span className="font-medium text-foreground">{row.name}</span> },
    { header: "Waiting", accessor: (row: QueueMetric) => <span className="font-mono text-sm">{row.waiting}</span> },
    { header: "Active", accessor: (row: QueueMetric) => (
      <span className={`font-mono text-sm font-medium ${row.active > 0 ? "text-primary" : "text-muted-foreground"}`}>
        {row.active}
      </span>
    )},
    { header: "Completed", accessor: (row: QueueMetric) => <span className="font-mono text-sm text-success">{row.completed.toLocaleString()}</span> },
    { header: "Failed", accessor: (row: QueueMetric) => (
      <span className={`font-mono text-sm font-medium ${row.failed > 0 ? "text-destructive" : "text-muted-foreground"}`}>
        {row.failed}
      </span>
    )},
    { header: "Delayed", accessor: (row: QueueMetric) => <span className={`font-mono text-sm ${row.delayed > 0 ? "text-warning" : "text-muted-foreground"}`}>{row.delayed}</span> },
    { header: "Status", accessor: (row: QueueMetric) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={queues} isLoading={isLoading} />;
}
