import React from "react";
import { LoginHistory } from "../types/iam.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnDef } from "@tanstack/react-table";
import { History, ShieldAlert } from "lucide-react";

interface LoginHistoryTableProps {
  data: LoginHistory[];
  isLoading: boolean;
}

export function LoginHistoryTable({ data, isLoading }: LoginHistoryTableProps) {
  const columns: ColumnDef<LoginHistory, any>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-muted rounded text-muted-foreground">
            <History className="h-4.5 w-4.5" />
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
    { accessorKey: "ipAddress", header: "IP Address" },
    { accessorKey: "country", header: "Country" },
    { accessorKey: "loginTime", header: "Login Time" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const normStatus = status === "Success" ? "active" : status === "Failed" ? "suspended" : "pending";
        return <StatusBadge status={normStatus} className="capitalize">{status}</StatusBadge>;
      },
    },
  ];

  return <AppTable columns={columns} data={data} isLoading={isLoading} />;
}
