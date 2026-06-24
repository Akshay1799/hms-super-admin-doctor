import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface TenantDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenantName: string;
  tenantCode: string;
  isDeleting?: boolean;
}

export function TenantDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  tenantName,
  tenantCode,
  isDeleting = false,
}: TenantDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    if (confirmText.toUpperCase() === tenantCode.toUpperCase()) {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete Tenant"
      description="WARNING: Deleting a tenant will remove all associated clinics, hospitals, branches, users, and audit logs. This action is irreversible."
      confirmText={isDeleting ? "Deleting..." : "Permanently Delete"}
      cancelText="Cancel"
      type="destructive"
      size="md"
    >
      <div className="space-y-4 pt-2">
        <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
          <p className="text-xs text-muted-foreground">Tenant Selected:</p>
          <p className="font-semibold text-destructive">{tenantName} ({tenantCode})</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Type <span className="font-mono font-bold text-destructive">{tenantCode}</span> to confirm deletion:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={tenantCode}
            className="w-full h-10 px-3 rounded-[var(--radius-button)] border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50"
            disabled={isDeleting}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
