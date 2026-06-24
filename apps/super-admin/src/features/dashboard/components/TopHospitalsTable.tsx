"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { ColumnDef } from "@tanstack/react-table";
import { MOCK_HOSPITALS_PERFORMANCE } from "../mocks/dashboard.mock";
import { StatusBadge } from "@/components/ui/status-badge";

interface HospitalPerformance {
  name: string;
  admissions: number;
  revenue: number;
  patients: number;
}

export function TopHospitalsTable() {
  const columns: ColumnDef<HospitalPerformance>[] = [
    {
      accessorKey: "name",
      header: "Hospital Unit",
      cell: (info) => <span className="font-semibold">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "patients",
      header: "Active Patients",
      cell: (info) => <span className="font-mono">{info.getValue() as number}</span>,
    },
    {
      accessorKey: "admissions",
      header: "Monthly Admissions",
      cell: (info) => <span className="font-mono">{info.getValue() as number}</span>,
    },
    {
      accessorKey: "revenue",
      header: "Revenue Generated",
      cell: (info) => (
        <span className="font-semibold font-mono text-primary">
          ₹{(info.getValue() as number / 100000).toFixed(1)}L
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: () => <StatusBadge status="active" />,
    },
  ];

  return (
    <div className="space-y-3 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold">Top Performing Hospitals</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Top 5 institutions mapped by transaction volumes and traffic.</p>
      </div>
      <AppTable columns={columns} data={MOCK_HOSPITALS_PERFORMANCE} />
    </div>
  );
}
