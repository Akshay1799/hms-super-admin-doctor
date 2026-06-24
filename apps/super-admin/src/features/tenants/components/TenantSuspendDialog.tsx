import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface TenantSuspendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenantName: string;
  actionType: "suspend" | "activate";
  isLoading?: boolean;
}

export function TenantSuspendDialog({
  isOpen,
  onClose,
  onConfirm,
  tenantName,
  actionType,
  isLoading = false,
}: TenantSuspendDialogProps) {
  const isSuspend = actionType === "suspend";

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={isSuspend ? "Suspend Tenant" : "Activate Tenant"}
      description={
        isSuspend
          ? `Are you sure you want to suspend "${tenantName}"? Suspending a tenant will block login for all users under this tenant.`
          : `Are you sure you want to reactivate "${tenantName}"? Reactivating a tenant will restore access for all its users.`
      }
      confirmText={
        isLoading
          ? isSuspend
            ? "Suspending..."
            : "Activating..."
          : isSuspend
          ? "Suspend"
          : "Activate"
      }
      cancelText="Cancel"
      type={isSuspend ? "destructive" : "info"}
      size="md"
    />
  );
}
