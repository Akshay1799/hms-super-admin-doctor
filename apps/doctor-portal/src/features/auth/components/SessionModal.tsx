import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SessionModalProps {
  isOpen: boolean;
  countdown: number;
  onStaySignedIn: () => void;
  onLogout: () => void;
}

export function SessionModal({ isOpen, countdown, onStaySignedIn, onLogout }: SessionModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onLogout}
      onConfirm={onStaySignedIn}
      title="Session Expiration Warning"
      confirmText="Stay Signed In"
      cancelText="Log Out"
      type="info"
      size="sm"
    >
      <div className="space-y-3">
        <p className="text-sm text-foreground">
          Due to inactivity, your clinical session will expire shortly.
        </p>
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Logging out in:</p>
          <p className="text-2xl font-extrabold text-warning mt-1 font-mono">{countdown}s</p>
        </div>
      </div>
    </ConfirmDialog>
  );
}
