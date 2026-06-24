import React, { useState, useRef, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Tenant } from "../types/tenant.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoreVertical, Eye, Edit2, ShieldAlert, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";

interface TenantTableProps {
  data: Tenant[];
  isLoading: boolean;
  onEdit: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
  onActivate: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

export function TenantTable({
  data,
  isLoading,
  onEdit,
  onSuspend,
  onActivate,
  onDelete,
}: TenantTableProps) {
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

  const columns: ColumnDef<Tenant, any>[] = [
    {
      accessorKey: "name",
      header: "Tenant",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
              <Link href={`/tenants/${tenant.id}`}>{tenant.name}</Link>
            </span>
            <span className="text-xs text-muted-foreground font-mono">{tenant.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "plan",
      header: "Subscription Plan",
      cell: ({ row }) => {
        const plan = row.getValue("plan") as string;
        return <span className="font-medium text-foreground">{plan}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      header: "Usage Metrics",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground min-w-[200px]">
            <div>
              <span className="font-semibold text-foreground">{tenant.hospitalCount}</span> Hosp
            </div>
            <div>
              <span className="font-semibold text-foreground">{tenant.branchCount}</span> Brch
            </div>
            <div>
              <span className="font-semibold text-foreground">{tenant.userCount}</span> Users
            </div>
          </div>
        );
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
        const tenant = row.original;
        const isOpen = activeMenuId === tenant.id;

        return (
          <div className="relative flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isOpen ? null : tenant.id);
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
                  href={`/tenants/${tenant.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Details
                </Link>
                <button
                  onClick={() => {
                    onEdit(tenant);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Edit Settings
                </button>
                {tenant.status === "Suspended" ? (
                  <button
                    onClick={() => {
                      onActivate(tenant);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/5 rounded-md transition-colors w-full text-left cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate Tenant
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSuspend(tenant);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/5 rounded-md transition-colors w-full text-left cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Suspend Tenant
                  </button>
                )}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    onDelete(tenant);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Tenant
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
          <p className="text-base font-semibold text-foreground">No tenants found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search filters or create a new tenant.
          </p>
        </div>
      }
    />
  );
}
