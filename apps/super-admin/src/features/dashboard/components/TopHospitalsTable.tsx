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

import { useAuthStore } from "@/store/auth.store";

interface HospitalPerformance {
  name: string;
  admissions: number;
  revenue: number;
  patients: number;
}

export function TopHospitalsTable() {
  const { user } = useAuthStore();
  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  const data: HospitalPerformance[] = isTenantAdmin
    ? [
        { name: "Apollo Delhi (Main)", admissions: 1420, revenue: 3200000, patients: 8400 },
        { name: "Apollo Cardiac Clinic", admissions: 340, revenue: 1600000, patients: 1200 },
      ]
    : MOCK_HOSPITALS_PERFORMANCE;

  const columns: ColumnDef<HospitalPerformance>[] = [
    {
      accessorKey: "name",
      header: isTenantAdmin ? "Organization Branch" : "Hospital Unit",
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
        <h3 className="text-base font-bold">{isTenantAdmin ? "Apollo Clinics Branch Performance" : "Top Performing Hospitals"}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isTenantAdmin ? "Performance and patient volume across your hospital branches." : "Top 5 institutions mapped by transaction volumes and traffic."}
        </p>
      </div>
      <AppTable columns={columns} data={data} />
    </div>
  );
}
