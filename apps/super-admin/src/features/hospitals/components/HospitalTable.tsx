import React, { useState, useRef, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Hospital } from "../types/hospital.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoreVertical, Eye, Edit2, ShieldAlert, CheckCircle, Trash2, GitBranch, LayoutGrid, Settings } from "lucide-react";
import Link from "next/link";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";

interface HospitalTableProps {
  data: Hospital[];
  isLoading: boolean;
  onSuspend: (hospital: Hospital) => void;
  onActivate: (hospital: Hospital) => void;
  onDelete: (hospital: Hospital) => void;
}

export function HospitalTable({
  data,
  isLoading,
  onSuspend,
  onActivate,
  onDelete,
}: HospitalTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTenantName = (tenantId: string) => {
    return MOCK_TENANTS.find((t) => t.id === tenantId)?.name || `Tenant #${tenantId}`;
  };

  const columns: ColumnDef<Hospital, any>[] = [
    {
      accessorKey: "name",
      header: "Hospital Name",
      cell: ({ row }) => {
        const hospital = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
              <Link href={`/hospitals/${hospital.id}`}>{hospital.name}</Link>
            </span>
            <span className="text-xs text-muted-foreground font-mono">{hospital.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "tenantId",
      header: "Tenant",
      cell: ({ row }) => {
        const tenantId = row.getValue("tenantId") as string;
        return <span className="text-sm font-medium text-foreground">{getTenantName(tenantId)}</span>;
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-semibold text-foreground border border-border">
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "branchCount",
      header: "Branches",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.getValue("branchCount")}</span>
      ),
    },
    {
      accessorKey: "doctorCount",
      header: "Doctors",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.getValue("doctorCount")}</span>
      ),
    },
    {
      accessorKey: "patientCount",
      header: "Patients",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.getValue("patientCount")}</span>
      ),
    },
    {
      accessorKey: "bedCount",
      header: "Beds",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.getValue("bedCount")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        // Map "under review" -> pending colors, and others accordingly
        const displayStatus = status === "Under Review" ? "pending" : status;
        return <StatusBadge status={displayStatus} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return <span className="text-sm font-mono text-muted-foreground">{date}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const hospital = row.original;
        const isOpen = activeMenuId === hospital.id;

        return (
          <div className="relative flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isOpen ? null : hospital.id);
              }}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-9 z-50 w-48 rounded-[var(--radius-card)] border border-border bg-card p-1 shadow-lg animate-in fade-in duration-100 min-w-[12rem]"
              >
                <Link
                  href={`/hospitals/${hospital.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Overview
                </Link>
                <Link
                  href={`/hospitals/${hospital.id}?tab=branches`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
                >
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  Branches
                </Link>
                <Link
                  href={`/hospitals/${hospital.id}?tab=departments`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
                >
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  Departments
                </Link>
                <Link
                  href={`/hospitals/${hospital.id}?tab=settings`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
                {hospital.status === "Suspended" ? (
                  <button
                    onClick={() => {
                      onActivate(hospital);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/5 rounded-md transition-colors w-full text-left cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate Hospital
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSuspend(hospital);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/5 rounded-md transition-colors w-full text-left cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Suspend Hospital
                  </button>
                )}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    onDelete(hospital);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Hospital
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-base font-semibold text-foreground">No hospitals found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search filters or create a new hospital node.
          </p>
        </div>
      }
    />
  );
}
