"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useStaff } from "@/features/clinical/hooks/useClinical";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { Users2, Contact } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Staff } from "@/features/clinical/types/clinical.types";

export default function StaffPage() {
  const [hospitalId, setHospitalId] = useState("");
  const [type, setType] = useState("");

  const { data: staff = [], isLoading } = useStaff({
    hospitalId: hospitalId || undefined,
    type: type || undefined,
  });

  const getHospitalName = (hId: string) => {
    return MOCK_HOSPITALS.find((h) => h.id === hId)?.name || `Hospital #${hId}`;
  };

  const columns: ColumnDef<Staff, any>[] = [
    {
      accessorKey: "id",
      header: "Staff ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Staff Name",
      cell: ({ row }) => <span className="font-semibold text-foreground text-sm">{row.original.name}</span>,
    },
    {
      accessorKey: "type",
      header: "Staff Role",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "hospitalId",
      header: "Hospital Location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{getHospitalName(row.original.hospitalId)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const staffTypes = ["Receptionist", "Pharmacist", "Lab Technician", "Radiologist", "Admin Staff", "Billing Staff"];

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Staff Resources" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Staff Registry"
          description="Track administrative and clinical support staff distribution across medical facilities."
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
            <label className="text-xs font-semibold text-muted-foreground">Staff Role / Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Types</option>
              {staffTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AppTable
          columns={columns}
          data={staff}
          isLoading={isLoading}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
              <Contact className="h-8 w-8 mb-2 text-muted-foreground/45" />
              <p className="text-sm font-semibold">No staff found</p>
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
