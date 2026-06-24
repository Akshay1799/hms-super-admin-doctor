"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNotifications } from "../hooks/useNotifications";
import { Notification } from "../types/notifications.types";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export function NotificationTable() {
  const { notifications, isLoading, markRead, markAllRead } = useNotifications();

  const getPriorityDot = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-muted-foreground",
      medium: "bg-warning",
      high: "bg-orange-500",
      critical: "bg-destructive",
    };
    return <span className={`inline-block h-2 w-2 rounded-full ${colors[priority] || "bg-muted-foreground"}`} />;
  };

  const columns = [
    {
      header: "Title",
      accessor: (row: Notification) => (
        <div className="flex items-start gap-2">
          {getPriorityDot(row.priority)}
          <div>
            <p className={`font-medium ${!row.isRead ? "text-foreground" : "text-muted-foreground"}`}>{row.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.message}</p>
          </div>
        </div>
      ),
    },
    { header: "Type", accessor: (row: Notification) => <StatusBadge status={row.type} /> },
    { header: "Channel", accessor: (row: Notification) => <StatusBadge status={row.channel} /> },
    { header: "Priority", accessor: (row: Notification) => <span className="capitalize text-sm">{row.priority}</span> },
    { header: "Status", accessor: (row: Notification) => <StatusBadge status={row.status} /> },
    { header: "Created", accessor: (row: Notification) => new Date(row.createdAt).toLocaleString() },
    {
      header: "Actions",
      accessor: (row: Notification) =>
        !row.isRead ? (
          <Button variant="ghost" size="sm" onClick={() => markRead(row.id)}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark Read
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => markAllRead(undefined)}>
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>
      <AppTable columns={columns} data={notifications} isLoading={isLoading} />
    </div>
  );
}
