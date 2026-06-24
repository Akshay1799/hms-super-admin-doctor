import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm flex flex-col gap-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold leading-none text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 w-full min-h-[300px] h-[300px]">
        {children}
      </div>
    </div>
  );
}
