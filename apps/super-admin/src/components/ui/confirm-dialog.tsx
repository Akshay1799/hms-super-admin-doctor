import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  size = "md",
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // If destructive, never close on backdrop click to prevent accidental closes!
    if (type === "destructive") return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={handleBackdropClick} 
      />
      <div
        className={cn(
          "relative w-full rounded-[var(--radius-dialog)] bg-card border border-border p-6 shadow-xl animate-in zoom-in-95 duration-200 z-10 space-y-4",
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold leading-none text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {type !== "destructive" && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {children && <div className="text-sm text-foreground py-2">{children}</div>}

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-[var(--radius-button)] border border-border text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "h-10 px-4 rounded-[var(--radius-button)] text-sm font-semibold text-white transition-colors cursor-pointer",
              type === "destructive"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
