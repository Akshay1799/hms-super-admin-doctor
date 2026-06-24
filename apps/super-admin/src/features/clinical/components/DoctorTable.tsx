import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Doctor } from "@/features/clinical/types/clinical.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Star, Eye, Calendar, Stethoscope } from "lucide-react";
import Link from "next/link";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";

interface DoctorTableProps {
  data: Doctor[];
  isLoading: boolean;
}

export function DoctorTable({ data, isLoading }: DoctorTableProps) {
  const getHospitalName = (hId: string) => {
    return MOCK_HOSPITALS.find((h) => h.id === hId)?.name || `Hospital #${hId}`;
  };

  const columns: ColumnDef<Doctor, any>[] = [
    {
      accessorKey: "name",
      header: "Doctor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={row.original.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
              <Link href={`/doctors/${row.original.id}`}>{row.original.name}</Link>
            </span>
            <span className="text-xs text-muted-foreground">ID: {row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => <span className="text-sm font-medium text-foreground">{row.original.specialization}</span>,
    },
    {
      accessorKey: "hospitalId",
      header: "Hospital Location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{getHospitalName(row.original.hospitalId)}</span>,
    },
    {
      accessorKey: "patientsCount",
      header: "Total Patients",
      cell: ({ row }) => <span className="text-sm font-semibold text-foreground">{row.original.patientsCount}</span>,
    },
    {
      accessorKey: "experience",
      header: "Experience",
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.experience} Yrs</span>,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-sm font-semibold text-foreground">{row.original.rating}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const normStatus = status === "On Leave" ? "pending" : status;
        return <StatusBadge status={normStatus} />;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/doctors/${row.original.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/doctors/${row.original.id}?tab=schedule`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Calendar className="h-4 w-4" />
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
          <Stethoscope className="h-8 w-8 mb-2 text-muted-foreground/45" />
          <p className="text-sm font-semibold">No doctors found</p>
        </div>
      }
    />
  );
}
