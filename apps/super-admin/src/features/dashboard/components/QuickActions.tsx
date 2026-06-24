"use client";

import React from "react";
import { PlusCircle, Building, UserPlus, FileBarChart, Radio, ScrollText } from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const actions = [
    { label: "Create Tenant", icon: PlusCircle, onClick: () => toast.info("Triggered: Create Tenant Dialog") },
    { label: "Add Hospital", icon: Building, onClick: () => toast.info("Triggered: Add Hospital Dialog") },
    { label: "Invite Admin", icon: UserPlus, onClick: () => toast.info("Triggered: Invite Admin Dialog") },
    { label: "Generate Report", icon: FileBarChart, onClick: () => toast.info("Triggered: Generate Report Dialog") },
    { label: "Send Broadcast", icon: Radio, onClick: () => toast.info("Triggered: Send Broadcast Dialog") },
    { label: "View Audit Logs", icon: ScrollText, onClick: () => toast.info("Triggered: View Audit Logs view") },
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
            <button
              key={act.label}
              onClick={act.onClick}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/20 transition-all text-center space-y-2 cursor-pointer group"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground truncate max-w-full">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
