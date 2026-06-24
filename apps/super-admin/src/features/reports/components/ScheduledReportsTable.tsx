"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useScheduledReports } from "../hooks/use-reports";
import { ScheduledReport } from "../types/reports.types";
import { Button } from "@/components/ui/button";
import { Edit2, PauseCircle, Trash2 } from "lucide-react";

export function ScheduledReportsTable() {
  const { data: reports = [], isLoading } = useScheduledReports();

  const columns = [
    { header: "Report Name", accessor: (row: ScheduledReport) => <span className="font-semibold text-sm text-foreground">{row.name}</span> },
    { header: "Frequency", accessor: (row: ScheduledReport) => <span className="text-sm capitalize text-muted-foreground">{row.frequency}</span> },
    { header: "Recipients", accessor: (row: ScheduledReport) => <span className="text-sm">{row.recipients.join(', ')}</span> },
    { header: "Next Run", accessor: (row: ScheduledReport) => new Date(row.nextRun).toLocaleDateString() },
    { header: "Status", accessor: (row: ScheduledReport) => <StatusBadge status={row.status} /> },
    { header: "Actions", accessor: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" title="Edit Schedule"><Edit2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" title="Pause"><PauseCircle className="h-4 w-4 text-warning" /></Button>
        <Button variant="ghost" size="icon" title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    )},
  ];

  return <AppTable columns={columns} data={reports} isLoading={isLoading} />;
}
