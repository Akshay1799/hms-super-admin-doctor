import React from "react";
import { Session } from "../types/iam.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTerminateSession } from "../hooks/useIam";
import { ColumnDef } from "@tanstack/react-table";
import { LogOut, Laptop } from "lucide-react";

interface SessionTableProps {
  data: Session[];
  isLoading: boolean;
}

export function SessionTable({ data, isLoading }: SessionTableProps) {
  const terminateMutation = useTerminateSession();

  const columns: ColumnDef<Session, any>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-muted rounded text-muted-foreground">
            <Laptop className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">{row.original.userName}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.userEmail}</span>
          </div>
        </div>
      ),
    },
    { accessorKey: "device", header: "Device" },
    { accessorKey: "browser", header: "Browser" },
    { accessorKey: "os", header: "OS" },
    { accessorKey: "ipAddress", header: "IP Address" },
    { accessorKey: "loginTime", header: "Login Time" },
    { accessorKey: "lastActivity", header: "Last Activity" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const sess = row.original;
        return (
          <div className="flex justify-end">
            <button
              onClick={() => terminateMutation.mutate(sess.id)}
              disabled={terminateMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-button)] border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Terminate
            </button>
          </div>
        );
      },
    },
  ];

  return <AppTable columns={columns} data={data} isLoading={isLoading} />;
}
