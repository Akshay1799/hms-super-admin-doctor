import React, { useState, useRef, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "../types/iam.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { MoreVertical, Eye, Edit2, ShieldAlert, CheckCircle, Trash2, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";

interface UserTableProps {
  data: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onSuspend: (user: User) => void;
  onActivate: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  onSendInvite: (user: User) => void;
  onEnableMfa: (user: User) => void;
}

export function UserTable({
  data,
  isLoading,
  onEdit,
  onSuspend,
  onActivate,
  onDelete,
  onResetPassword,
  onSendInvite,
  onEnableMfa,
}: UserTableProps) {
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

  const getHospitalName = (hospId: string) => {
    return MOCK_HOSPITALS.find((h) => h.id === hospId)?.name || "All Unit Access";
  };

  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: "firstName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const fullName = `${user.firstName} ${user.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar fallback={fullName} size="sm" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
                <Link href={`/users/${user.id}`}>{fullName}</Link>
              </span>
              <span className="text-xs text-muted-foreground font-mono">{user.phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-sm font-medium text-foreground">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "role",
      header: "System Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "tenantId",
      header: "Tenant Account",
      cell: ({ row }) => <span className="text-sm text-foreground font-medium">{getTenantName(row.original.tenantId)}</span>,
    },
    {
      accessorKey: "hospitalId",
      header: "Hospital Scope",
      cell: ({ row }) => <span className="text-sm text-muted-foreground font-medium">{getHospitalName(row.original.hospitalId)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        // Map pending status to pending colors
        const displayStatus = status === "Pending" ? "pending" : status;
        return <StatusBadge status={displayStatus} />;
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Last Active",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono">{row.getValue("lastLogin")}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isOpen = activeMenuId === user.id;

        return (
          <div className="relative flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isOpen ? null : user.id);
              }}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-9 z-50 w-48 rounded-[var(--radius-card)] border border-border bg-card p-1 shadow-lg animate-in fade-in duration-100 min-w-[12.5rem]"
              >
                <Link
                  href={`/users/${user.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Details
                </Link>
                <button
                  onClick={() => {
                    onEdit(user);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Edit Settings
                </button>
                <button
                  onClick={() => {
                    onResetPassword(user);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    onSendInvite(user);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <MailCheck className="h-4 w-4 text-muted-foreground" />
                  Send Invitation
                </button>
                <button
                  onClick={() => {
                    onEnableMfa(user);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Configure MFA
                </button>
                {user.status === "Suspended" ? (
                  <button
                    onClick={() => {
                      onActivate(user);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/5 rounded-md transition-colors w-full text-left cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSuspend(user);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/5 rounded-md transition-colors w-full text-left cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Suspend User
                  </button>
                )}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    onDelete(user);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User
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
          <p className="text-base font-semibold text-foreground">No users found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search filters or register a new administrative account.
          </p>
        </div>
      }
    />
  );
}
