"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar.store";
import { sidebarConfig } from "@/config/sidebar.config";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, HeartPulse } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, toggle, close } = useSidebarStore();
  const { user } = useAuthStore();

  if (!user) return null;

  const content = (
    <div className="flex h-full flex-col bg-card border-r border-border text-foreground transition-all duration-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-extrabold text-base shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
              HMS Doctor Workspace
            </span>
          )}
        </Link>
        {mobileOpen && (
          <button
            onClick={close}
            className="lg:hidden text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {sidebarConfig.map((group) => (
          <div key={group.groupName} className="space-y-1.5">
            {(!collapsed || mobileOpen) && (
              <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                {group.groupName}
              </h4>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      if (mobileOpen) close();
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Profile / Options */}
      <div className="border-t border-border p-3 space-y-2">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-muted/40">
            <Avatar fallback={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase">{user.specialty}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            "hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:block h-screen overflow-hidden shrink-0 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={close} />
          {/* Panel */}
          <aside className="relative w-64 h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
