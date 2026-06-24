"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAdmissions } from "@/features/clinical/hooks/useClinical";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClipboardList, Stethoscope } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Admission } from "@/features/clinical/types/clinical.types";

export default function AdmissionsPage() {
  const { data: admissions = [], isLoading } = useAdmissions();

  const columns: ColumnDef<Admission, any>[] = [
    {
      accessorKey: "id",
      header: "Admission ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => <span className="font-semibold text-foreground text-sm">{row.original.patientName}</span>,
    },
    {
      accessorKey: "hospitalName",
      header: "Admitted Hospital",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.hospitalName}</span>,
    },
    {
      accessorKey: "type",
      header: "Admission Type",
      cell: ({ row }) => {
        const type = row.original.type;
        const color = type === "Emergency" ? "text-destructive bg-destructive/10 border-destructive/20" : type === "IPD" ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground bg-muted border-border";
        return (
          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${color}`}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "admissionDate",
      header: "Admission Date",
      cell: ({ row }) => <span className="text-sm font-mono text-muted-foreground">{row.original.admissionDate}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "dischargeDate",
      header: "Discharge Date",
      cell: ({ row }) => <span className="text-sm font-mono text-muted-foreground">{row.original.dischargeDate || "-"}</span>,
    },
  ];

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Admissions" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Hospital Admissions & Emergency Care"
          description="Supervise active admissions (IPD/OPD/Emergency) across all platforms."
        />

        <AppTable
          columns={columns}
          data={admissions}
          isLoading={isLoading}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
              <ClipboardList className="h-8 w-8 mb-2 text-muted-foreground/45" />
              <p className="text-sm font-semibold">No admissions records found</p>
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
