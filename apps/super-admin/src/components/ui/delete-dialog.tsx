import React from "react";
import { ConfirmDialog } from "./confirm-dialog";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this? This action cannot be undone.",
  itemName,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Delete"
      cancelText="Cancel"
      type="destructive"
      size="sm"
    >
      {itemName && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3 mt-2">
          <p className="text-xs text-muted-foreground">Deleting:</p>
          <p className="font-semibold text-destructive">{itemName}</p>
        </div>
      )}
    </ConfirmDialog>
  );
}
