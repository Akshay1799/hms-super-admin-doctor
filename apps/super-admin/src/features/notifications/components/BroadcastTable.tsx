"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBroadcasts } from "../hooks/useNotifications";
import { Broadcast } from "../types/notifications.types";
import { Button } from "@/components/ui/button";
import { Eye, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function BroadcastTable() {
  const { data: broadcasts = [], isLoading } = useBroadcasts();
  const router = useRouter();

  const columns = [
    {
      header: "Title",
      accessor: (row: Broadcast) => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    { header: "Channel", accessor: (row: Broadcast) => <StatusBadge status={row.channel} /> },
    {
      header: "Audience",
      accessor: (row: Broadcast) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="capitalize">{row.audience.replace(/-/g, " ")}</span>
        </div>
      ),
    },
    { header: "Priority", accessor: (row: Broadcast) => <StatusBadge status={row.priority} /> },
    {
      header: "Scheduled",
      accessor: (row: Broadcast) => new Date(row.scheduledAt).toLocaleDateString(),
    },
    {
      header: "Recipients",
      accessor: (row: Broadcast) => (
        <span className="text-sm font-medium">{row.recipientCount > 0 ? row.recipientCount.toLocaleString() : "-"}</span>
      ),
    },
    { header: "Status", accessor: (row: Broadcast) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: (row: Broadcast) => (
        <Button variant="ghost" size="icon" onClick={() => router.push(`/broadcasts/${row.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return <AppTable columns={columns} data={broadcasts} isLoading={isLoading} />;
}
