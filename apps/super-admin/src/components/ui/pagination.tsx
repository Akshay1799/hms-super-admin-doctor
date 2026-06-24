import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const startItem = (meta.page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 rounded-b-[var(--radius-card)] border-x border-b",
        className
      )}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, meta.page - 1))}
          disabled={meta.page <= 1}
          className="relative inline-flex items-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, meta.page + 1))}
          disabled={meta.page >= totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
            <span className="font-semibold text-foreground">{endItem}</span> of{" "}
            <span className="font-semibold text-foreground">{meta.total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, meta.page - 1))}
              disabled={meta.page <= 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground border border-input bg-card hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === meta.page;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-xs font-semibold border border-input cursor-pointer",
                    isCurrent
                      ? "z-10 bg-primary text-white border-primary"
                      : "bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, meta.page + 1))}
              disabled={meta.page >= totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground border border-input bg-card hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
