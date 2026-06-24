"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useWebhooks } from "../hooks/use-integrations";
import { Webhook } from "../types/integrations.types";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Power } from "lucide-react";

export function WebhookTable() {
  const { data: webhooks = [], isLoading } = useWebhooks();

  const columns = [
    {
      header: "Event",
      accessor: (row: Webhook) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">{row.event}</code>
      ),
    },
    {
      header: "URL",
      accessor: (row: Webhook) => (
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] block">{row.url}</span>
      ),
    },
    {
      header: "Method",
      accessor: (row: Webhook) => (
        <span className="text-xs font-bold text-primary">{row.method}</span>
      ),
    },
    { header: "Retries", accessor: (row: Webhook) => row.retryCount },
    { header: "Status", accessor: (row: Webhook) => <StatusBadge status={row.status} /> },
    {
      header: "Last Triggered",
      accessor: (row: Webhook) =>
        row.lastTriggered ? new Date(row.lastTriggered).toLocaleString() : "Never",
    },
    {
      header: "Actions",
      accessor: (row: Webhook) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Power className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={webhooks} isLoading={isLoading} />;
}
