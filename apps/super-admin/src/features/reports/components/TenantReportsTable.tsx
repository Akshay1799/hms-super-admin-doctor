"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTenantReports } from "../hooks/use-reports";
import { TenantReport } from "../types/reports.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csv";
import { toast } from "sonner";

export function TenantReportsTable() {
  const { data: tenants = [], isLoading } = useTenantReports();

  const columns = [
    { header: "Tenant", accessor: (row: TenantReport) => <span className="font-semibold text-sm text-foreground">{row.tenant}</span> },
    { header: "Plan", accessor: (row: TenantReport) => <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{row.plan}</span> },
    { header: "Hospitals", accessor: (row: TenantReport) => <span className="text-sm font-mono">{row.hospitals}</span> },
    { header: "Users", accessor: (row: TenantReport) => <span className="text-sm font-mono">{row.users.toLocaleString()}</span> },
    { header: "Revenue", accessor: (row: TenantReport) => <span className="text-sm font-mono font-medium">${row.revenue.toLocaleString()}</span> },
    { header: "Status", accessor: (row: TenantReport) => <StatusBadge status={row.status} /> },
    { header: "Actions", accessor: (row: TenantReport) => (
      <Button variant="ghost" size="sm" onClick={() => {
        const mockData = [
          { Parameter: "Tenant Group", Value: row.tenant },
          { Parameter: "Registered Hospitals Count", Value: row.hospitals },
          { Parameter: "Registered Active Users", Value: row.users },
          { Parameter: "Current Annual Revenue", Value: `$${row.revenue.toLocaleString()}` },
          { Parameter: "Plan Tier", Value: row.plan },
          { Parameter: "Platform Status", Value: row.status.toUpperCase() }
        ];
        downloadCSV(mockData, `tenant-report-${row.tenant.toLowerCase().replace(/\s+/g, '-')}.csv`);
        toast.success(`Export details saved for ${row.tenant}.`);
      }}>
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
    ) },
  ];

  return <AppTable columns={columns} data={tenants} isLoading={isLoading} />;
}
