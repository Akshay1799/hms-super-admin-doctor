import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FolderOpen className="h-10 w-10 text-muted-foreground/60" />,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-[var(--radius-card)] border border-dashed border-border bg-card/50 min-h-[320px] max-w-md mx-auto space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-10 px-4 rounded-[var(--radius-button)] bg-primary hover:bg-primary/95 text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
