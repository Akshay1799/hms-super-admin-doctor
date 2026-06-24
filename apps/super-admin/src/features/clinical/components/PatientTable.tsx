import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Patient } from "@/features/clinical/types/clinical.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Eye, Users } from "lucide-react";
import Link from "next/link";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";
import { MOCK_DOCTORS } from "../mocks/clinical.mocks";

interface PatientTableProps {
  data: Patient[];
  isLoading: boolean;
}

export function PatientTable({ data, isLoading }: PatientTableProps) {
  const getHospitalName = (hId: string) => {
    return MOCK_HOSPITALS.find((h) => h.id === hId)?.name || `Hospital #${hId}`;
  };

  const getDoctorName = (docId: string) => {
    return MOCK_DOCTORS.find((d) => d.id === docId)?.name || `Doctor #${docId}`;
  };

  const columns: ColumnDef<Patient, any>[] = [
    {
      accessorKey: "id",
      header: "Patient ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
          <Link href={`/patients/${row.original.id}`}>{row.original.name}</Link>
        </span>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground border border-border">
          {row.original.gender}
        </span>
      ),
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.age} Yrs</span>,
    },
    {
      accessorKey: "hospitalId",
      header: "Hospital Location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{getHospitalName(row.original.hospitalId)}</span>,
    },
    {
      accessorKey: "doctorId",
      header: "Primary Physician",
      cell: ({ row }) => <span className="text-sm text-foreground font-medium">{getDoctorName(row.original.doctorId)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "lastVisit",
      header: "Last Visit",
      cell: ({ row }) => <span className="text-sm font-mono text-muted-foreground">{row.original.lastVisit}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link
            href={`/patients/${row.original.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
          <Users className="h-8 w-8 mb-2 text-muted-foreground/45" />
          <p className="text-sm font-semibold">No patients found</p>
        </div>
      }
    />
  );
}
