import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type?: "card" | "table" | "chart" | "form";
  className?: string;
}

export function LoadingSkeleton({ type = "card", className }: LoadingSkeletonProps) {
  const base = "animate-pulse rounded bg-muted";

  if (type === "table") {
    return (
      <div className={cn("space-y-4 w-full", className)}>
        <div className="flex space-x-4 border-b border-border pb-4">
          <div className={`${base} h-4 w-1/4`} />
          <div className={`${base} h-4 w-1/4`} />
          <div className={`${base} h-4 w-1/4`} />
          <div className={`${base} h-4 w-1/4`} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex space-x-4 py-2 border-b border-border/50">
            <div className={`${base} h-4 w-1/3`} />
            <div className={`${base} h-4 w-1/4`} />
            <div className={`${base} h-4 w-1/6`} />
            <div className={`${base} h-4 w-1/5`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className={cn("border border-border rounded-[var(--radius-card)] p-6 space-y-6 bg-card", className)}>
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-1/3">
            <div className={`${base} h-4 w-3/4`} />
            <div className={`${base} h-3 w-1/2`} />
          </div>
          <div className={`${base} h-8 w-16`} />
        </div>
        <div className="flex items-end justify-between gap-2 h-48 pt-4">
          <div className={`${base} w-12 h-[20%]`} />
          <div className={`${base} w-12 h-[45%]`} />
          <div className={`${base} w-12 h-[30%]`} />
          <div className={`${base} w-12 h-[75%]`} />
          <div className={`${base} w-12 h-[60%]`} />
          <div className={`${base} w-12 h-[90%]`} />
        </div>
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className={cn("space-y-6 bg-card border border-border p-6 rounded-[var(--radius-card)]", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className={`${base} h-3.5 w-1/5`} />
              <div className={`${base} h-10 w-full rounded-[var(--radius-input)]`} />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 gap-3 border-t border-border">
          <div className={`${base} h-10 w-24 rounded-[var(--radius-button)]`} />
          <div className={`${base} h-10 w-24 rounded-[var(--radius-button)]`} />
        </div>
      </div>
    );
  }

  // Default: Card Skeleton
  return (
    <div className={cn("border border-border rounded-[var(--radius-card)] p-6 bg-card shadow-sm space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className={`${base} h-4 w-1/3`} />
        <div className={`${base} h-9 w-9 rounded-lg`} />
      </div>
      <div className="space-y-2">
        <div className={`${base} h-8 w-1/2`} />
        <div className={`${base} h-3 w-3/4`} />
      </div>
    </div>
  );
}
