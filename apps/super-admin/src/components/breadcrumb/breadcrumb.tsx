"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Split segments and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);

  const formatSegment = (str: string) => {
    return decodeURIComponent(str)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className={cn("flex items-center space-x-1.5 text-xs text-muted-foreground", className)} aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = formatSegment(segment);

        // Don't show 'Dashboard' duplicate segment if home is Dashboard
        if (segment.toLowerCase() === "dashboard" && index === 0 && segments.length > 1) {
          return null;
        }

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-semibold text-foreground">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
