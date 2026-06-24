import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Appointment } from "@/features/clinical/types/clinical.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, Eye } from "lucide-react";
import Link from "next/link";

interface AppointmentTableProps {
  data: Appointment[];
  isLoading: boolean;
}

export function AppointmentTable({ data, isLoading }: AppointmentTableProps) {
  const columns: ColumnDef<Appointment, any>[] = [
    {
      accessorKey: "id",
      header: "Appointment ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
          <Link href={`/patients/${row.original.patientId}`}>{row.original.patientName}</Link>
        </span>
      ),
    },
    {
      accessorKey: "doctorName",
      header: "Doctor",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          <Link href={`/doctors/${row.original.doctorId}`}>{row.original.doctorName}</Link>
        </span>
      ),
    },
    {
      accessorKey: "hospitalName",
      header: "Hospital Location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.hospitalName}</span>,
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{row.original.date}</span>
          <span className="text-xs text-muted-foreground font-mono">{row.original.timeSlot}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
          <Calendar className="h-8 w-8 mb-2 text-muted-foreground/45" />
          <p className="text-sm font-semibold">No appointments found</p>
        </div>
      }
    />
  );
}
