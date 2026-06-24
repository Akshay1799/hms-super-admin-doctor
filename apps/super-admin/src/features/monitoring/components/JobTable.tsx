"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useJobs } from "../hooks/use-monitoring";
import { JobRecord } from "../types/monitoring.types";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, Eye } from "lucide-react";

export function JobTable() {
  const { data: jobs = [], isLoading } = useJobs();

  const columns = [
    {
      header: "Job ID",
      accessor: (row: JobRecord) => (
        <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{row.jobId}</code>
      ),
    },
    { header: "Type", accessor: (row: JobRecord) => <span className="font-medium text-foreground text-sm">{row.type}</span> },
    { header: "Queue", accessor: (row: JobRecord) => <span className="text-sm capitalize">{row.queue}</span> },
    { header: "Status", accessor: (row: JobRecord) => <StatusBadge status={row.status} /> },
    { header: "Started At", accessor: (row: JobRecord) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "—" },
    { header: "Finished At", accessor: (row: JobRecord) => row.finishedAt ? new Date(row.finishedAt).toLocaleString() : "—" },
    {
      header: "Retries",
      accessor: (row: JobRecord) => (
        <span className={`font-mono text-sm ${row.retries > 2 ? "text-destructive font-bold" : row.retries > 0 ? "text-warning" : "text-muted-foreground"}`}>
          {row.retries}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: JobRecord) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
          {row.status === "failed" && (
            <Button variant="ghost" size="icon" title="Retry"><RefreshCw className="h-4 w-4 text-warning" /></Button>
          )}
          {(row.status === "waiting" || row.status === "delayed") && (
            <Button variant="ghost" size="icon" title="Cancel"><X className="h-4 w-4 text-destructive" /></Button>
          )}
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={jobs} isLoading={isLoading} />;
}
