"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationTable } from "@/features/notifications/components/NotificationTable";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

const TABS = ["All", "Unread", "Read", "Archived"] as const;
type Tab = typeof TABS[number];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const { unreadCount, markAllRead, clearAll } = useNotifications();

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Platform-wide alerts and system messages"
        actions={
          <>
            <Button variant="outline" onClick={() => markAllRead(undefined)}>
              <Bell className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="outline" onClick={() => clearAll(undefined)}>
              <BellOff className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </>
        }
      />

      <div className="mt-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tab === "Unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <NotificationTable />
      </div>
    </PageContainer>
  );
}
