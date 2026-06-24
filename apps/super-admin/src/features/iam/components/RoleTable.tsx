import React, { useState, useRef, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Role } from "../types/iam.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoreVertical, Edit2, Copy, Trash2, KeyRound } from "lucide-react";
import { MOCK_USERS } from "../mocks/iam.mocks";

interface RoleTableProps {
  data: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleTable({
  data,
  isLoading,
  onEdit,
  onDuplicate,
  onDelete,
}: RoleTableProps) {
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

  const getUserCount = (roleName: string) => {
    return MOCK_USERS.filter((u) => u.role === roleName).length;
  };

  const getPermissionsCount = (role: Role) => {
    if (role.permissions.includes("*")) return 14 * 6; // Mock all permissions count
    return role.permissions.length;
  };

  const columns: ColumnDef<Role, any>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => (
        <span className="font-bold text-foreground text-sm">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground leading-normal max-w-sm block truncate">
          {row.original.description}
        </span>
      ),
    },
    {
      header: "Users Assigned",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{getUserCount(row.original.name)}</span>
      ),
    },
    {
      header: "Active Permissions",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{getPermissionsCount(row.original)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const role = row.original;
        const isOpen = activeMenuId === role.id;

        return (
          <div className="relative flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isOpen ? null : role.id);
              }}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-9 z-50 w-48 rounded-[var(--radius-card)] border border-border bg-card p-1 shadow-lg animate-in fade-in duration-100 min-w-[10.5rem]"
              >
                <button
                  onClick={() => {
                    onEdit(role);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Edit Settings
                </button>
                <button
                  onClick={() => {
                    onDuplicate(role);
                    setActiveMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors w-full text-left cursor-pointer"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Duplicate Role
                </button>
                {role.name !== "SUPER_ADMIN" && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        onDelete(role);
                        setActiveMenuId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-md transition-colors w-full text-left cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Role
                    </button>
                  </>
                )}
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
          <p className="text-base font-semibold text-foreground">No roles configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configure default custom RBAC settings.
          </p>
        </div>
      }
    />
  );
}
