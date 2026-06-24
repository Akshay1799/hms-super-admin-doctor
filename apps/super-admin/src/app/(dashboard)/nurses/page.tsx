"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useNurses } from "@/features/clinical/hooks/useClinical";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { ShieldCheck, CalendarRange } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Nurse } from "@/features/clinical/types/clinical.types";

export default function NursesPage() {
  const [hospitalId, setHospitalId] = useState("");
  const [shift, setShift] = useState("");

  const { data: nurses = [], isLoading } = useNurses({
    hospitalId: hospitalId || undefined,
    shift: shift || undefined,
  });

  const getHospitalName = (hId: string) => {
    return MOCK_HOSPITALS.find((h) => h.id === hId)?.name || `Hospital #${hId}`;
  };

  const columns: ColumnDef<Nurse, any>[] = [
    {
      accessorKey: "id",
      header: "Nurse ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Nurse Name",
      cell: ({ row }) => <span className="font-semibold text-foreground text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: "hospitalId",
      header: "Hospital location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{getHospitalName(row.original.hospitalId)}</span>,
    },
    {
      accessorKey: "shift",
      header: "Duty Shift",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {row.original.shift}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Nurses" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Nurse Roster & Duty Shifts"
          description="Monitor nursing care resources, active shifts, and service deployments."
        />

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border rounded-xl p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Hospital Location</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Locations</option>
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Duty Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>
        </div>

        <AppTable
          columns={columns}
          data={nurses}
          isLoading={isLoading}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
              <CalendarRange className="h-8 w-8 mb-2 text-muted-foreground/45" />
              <p className="text-sm font-semibold">No nurses found</p>
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
