import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  ...props
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between gap-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div className="rounded-lg bg-primary/5 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={cn(
                  "font-semibold",
                  trend.type === "up" && "text-success",
                  trend.type === "down" && "text-destructive",
                  trend.type === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.type === "up" && "+"}
                {trend.value}
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
