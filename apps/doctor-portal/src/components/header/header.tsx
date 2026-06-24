"use client";

import React, { useState } from "react";
import { useSidebarStore } from "@/store/sidebar.store";
import { useThemeStore } from "@/store/theme.store";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Breadcrumb } from "@/components/breadcrumb/breadcrumb";
import { ProfileMenu } from "@/components/profile-menu/profile-menu";
import { NotificationDrawer } from "@/components/notification-drawer/notification-drawer";
import { Menu, Search, Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { open } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 sticky top-0 items-center justify-between border-b border-border bg-card px-6 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={open}
            className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search shortcut hint */}
          <div className="hidden sm:flex items-center gap-2 border border-border bg-muted/30 px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-semibold">
            <Search className="h-3.5 w-3.5" />
            <span>Search Patients...</span>
            <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-[9px] font-mono select-none">
              Ctrl + K
            </kbd>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Open Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
            )}
          </button>

          {/* Profile Dropdown Menu */}
          <ProfileMenu />
        </div>
      </header>

      {/* Slideout Notification drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </>
  );
}
