"use client";

import React from "react";
import { PlusCircle, Building, UserPlus, FileBarChart, Radio, ScrollText } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    { 
      label: "Create Tenant", 
      icon: PlusCircle, 
      href: "/tenants/create", 
      tooltip: "Provision a new tenant organization subscription" 
    },
    { 
      label: "Add Hospital", 
      icon: Building, 
      href: "/hospitals/create", 
      tooltip: "Register a new clinical facility branch" 
    },
    { 
      label: "Invite Admin", 
      icon: UserPlus, 
      href: "/users/create", 
      tooltip: "Grant platform administrative access credentials" 
    },
    { 
      label: "Generate Report", 
      icon: FileBarChart, 
      href: "/reports", 
      tooltip: "Export platform metrics, bills & audits summaries" 
    },
    { 
      label: "Send Broadcast", 
      icon: Radio, 
      href: "/broadcasts/create", 
      tooltip: "Transmit system-wide notifications instantly" 
    },
    { 
      label: "View Audit Logs", 
      icon: ScrollText, 
      href: "/audit/logs", 
      tooltip: "Review detailed user activities & compliance records" 
    },
  ];

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold">Quick Actions</h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-semibold uppercase">Platform shortcuts</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              title={act.tooltip}
              className="relative flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/20 transition-all text-center space-y-2 group cursor-pointer"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground truncate max-w-full">
                {act.label}
              </span>

              {/* Custom CSS Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
                <div className="bg-zinc-950 text-white text-[10px] font-bold py-1 px-2.5 rounded shadow-lg border border-zinc-800 whitespace-nowrap">
                  {act.tooltip}
                </div>
                {/* Tooltip Arrow */}
                <div className="w-1.5 h-1.5 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 -mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

