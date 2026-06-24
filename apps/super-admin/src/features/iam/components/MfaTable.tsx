import React, { useState } from "react";
import { MfaSettings } from "../types/iam.types";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useEnableMfa, useDisableMfa } from "../hooks/useIam";
import { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, ShieldAlert, Key, Settings } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";

interface MfaTableProps {
  data: MfaSettings[];
  isLoading: boolean;
}

export function MfaTable({ data, isLoading }: MfaTableProps) {
  const [selectedUser, setSelectedUser] = useState<MfaSettings | null>(null);
  const [mfaMethod, setMfaMethod] = useState<MfaSettings["method"]>("Email OTP");

  const enableMutation = useEnableMfa(selectedUser?.userId || "");
  const disableMutation = useDisableMfa(selectedUser?.userId || "");

  const handleConfigure = () => {
    if (!selectedUser) return;
    enableMutation.mutate(mfaMethod, {
      onSuccess: () => setSelectedUser(null),
    });
  };

  const columns: ColumnDef<MfaSettings, any>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-muted rounded text-muted-foreground">
            <Key className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">{row.original.userName}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.userEmail}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "mfaEnabled",
      header: "MFA Status",
      cell: ({ row }) => {
        const enabled = row.original.mfaEnabled;
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold uppercase ${
              enabled ? "text-success" : "text-muted-foreground"
            }`}
          >
            {enabled ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {enabled ? "Active" : "Disabled"}
          </span>
        );
      },
    },
    { accessorKey: "method", header: "Method" },
    { accessorKey: "updatedAt", header: "Updated At" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setSelectedUser(user);
                setMfaMethod(user.method);
              }}
              className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-[var(--radius-button)] border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
              Configure
            </button>
            {user.mfaEnabled && (
              <button
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
                className="inline-flex items-center justify-center h-8 px-2.5 rounded-[var(--radius-button)] border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/5 transition-colors cursor-pointer"
              >
                Disable
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <AppTable columns={columns} data={data} isLoading={isLoading} />

      {/* MFA Configuration Dialog */}
      {selectedUser && (
        <ConfirmDialog
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onConfirm={handleConfigure}
          title={`Configure MFA - ${selectedUser.userName}`}
          confirmText={enableMutation.isPending ? "Configuring..." : "Enable MFA"}
          cancelText="Cancel"
        >
          <div className="space-y-4 pt-2">
            <FormField
              label="MFA Verification Method"
              as="select"
              value={mfaMethod}
              onChange={(e) => setMfaMethod(e.target.value as any)}
            >
              <option value="Email OTP">Email OTP Code</option>
              <option value="Authenticator App">Authenticator App (TOTP)</option>
              <option value="SMS OTP">SMS Mobile OTP</option>
            </FormField>
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
