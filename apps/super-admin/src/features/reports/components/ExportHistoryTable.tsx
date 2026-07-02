"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useExportHistory } from "../hooks/use-reports";
import { ExportHistory } from "../types/reports.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import { toast } from "sonner";

export function ExportHistoryTable() {
  const { data: history = [], isLoading } = useExportHistory();

  const columns = [
    { header: "Report Name", accessor: (row: ExportHistory) => <span className="font-semibold text-sm text-foreground">{row.reportName}</span> },
    { header: "Format", accessor: (row: ExportHistory) => <span className="text-sm font-bold uppercase text-muted-foreground">{row.format}</span> },
    { header: "Requested By", accessor: (row: ExportHistory) => <span className="text-sm">{row.requestedBy}</span> },
    { header: "Created At", accessor: (row: ExportHistory) => new Date(row.createdAt).toLocaleString() },
    { header: "Status", accessor: (row: ExportHistory) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: (row: ExportHistory) => (
        <Button variant="ghost" size="sm" disabled={row.status !== 'completed'} onClick={() => {
          const mockData = [
            { ID: "rec-1", Title: "Sample Compiled Report Row", Status: "Verified", Date: new Date().toLocaleDateString() },
            { ID: "rec-2", Title: "Another Data Field Record", Status: "Processed", Date: new Date().toLocaleDateString() }
          ];
          downloadCSV(mockData, `${row.reportName.toLowerCase().replace(/\s+/g, '-')}.${row.format.toLowerCase()}`);
          toast.success(`${row.reportName} downloaded successfully.`);
        }}>
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      )
    },
  ];

  return <AppTable columns={columns} data={history} isLoading={isLoading} />;
}
