"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTenantReports } from "../hooks/use-reports";
import { TenantReport } from "../types/reports.types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function TenantReportsTable() {
  const { data: tenants = [], isLoading } = useTenantReports();

  const columns = [
    { header: "Tenant", accessor: (row: TenantReport) => <span className="font-semibold text-sm text-foreground">{row.tenant}</span> },
    { header: "Plan", accessor: (row: TenantReport) => <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">{row.plan}</span> },
    { header: "Hospitals", accessor: (row: TenantReport) => <span className="text-sm font-mono">{row.hospitals}</span> },
    { header: "Users", accessor: (row: TenantReport) => <span className="text-sm font-mono">{row.users.toLocaleString()}</span> },
    { header: "Revenue", accessor: (row: TenantReport) => <span className="text-sm font-mono font-medium">${row.revenue.toLocaleString()}</span> },
    { header: "Status", accessor: (row: TenantReport) => <StatusBadge status={row.status} /> },
    { header: "Actions", accessor: () => <Button variant="ghost" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button> },
  ];

  return <AppTable columns={columns} data={tenants} isLoading={isLoading} />;
}
