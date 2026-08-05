"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { ColumnDef } from "@tanstack/react-table";
import { MOCK_HOSPITALS_PERFORMANCE } from "../mocks/dashboard.mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthStore } from "@/store/auth.store";
import { useRealHospitals } from "@/features/hospitals/hooks/useRealHospitals";

interface HospitalPerformance {
  name: string;
  admissions: number;
  revenue: number;
  patients: number;
}

export function TopHospitalsTable() {
  const { user } = useAuthStore();
  const isTenantAdmin = user?.role === "TENANT_ADMIN";
  const { data: realHospitals = [] } = useRealHospitals();

  const data: HospitalPerformance[] = React.useMemo(() => {
    if (realHospitals.length > 0) {
      const perfMap: Record<string, { admissions: number; revenue: number; patients: number }> = {
        "MediPlus Hospital": { admissions: 1420, revenue: 3200000, patients: 8400 },
        "Vivek Memorial Hospital": { admissions: 980, revenue: 2100000, patients: 5900 },
        "R K Hospital": { admissions: 1100, revenue: 2400000, patients: 6300 },
      };

      return realHospitals.map((h) => {
        const perf = perfMap[h.name] || { admissions: 950, revenue: 2000000, patients: 5000 };
        return {
          name: h.name,
          admissions: perf.admissions,
          revenue: perf.revenue,
          patients: perf.patients,
        };
      });
    }

    if (isTenantAdmin) {
      return [
        { name: "MediPlus Hospital", admissions: 1420, revenue: 3200000, patients: 8400 },
        { name: "Vivek Memorial Hospital", admissions: 980, revenue: 2100000, patients: 5900 },
        { name: "R K Hospital", admissions: 1100, revenue: 2400000, patients: 6300 },
      ];
    }

    return MOCK_HOSPITALS_PERFORMANCE;
  }, [realHospitals, isTenantAdmin]);

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
          ₹{((info.getValue() as number) / 100000).toFixed(1)}L
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
        <h3 className="text-base font-bold">
          {isTenantAdmin ? "Hospital Branch Performance" : "Top Performing Hospitals"}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isTenantAdmin
            ? "Performance and patient volume across your hospital branches."
            : "Top institutions mapped by transaction volumes and traffic."}
        </p>
      </div>
      <AppTable columns={columns} data={data} />
    </div>
  );
}
