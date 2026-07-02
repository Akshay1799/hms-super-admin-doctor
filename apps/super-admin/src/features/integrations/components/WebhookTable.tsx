"use client";

import React, { useState } from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useWebhooks, useUpdateWebhooks } from "../hooks/use-integrations";
import { Webhook } from "../types/integrations.types";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Power, X } from "lucide-react";
import { toast } from "sonner";

export function WebhookTable() {
  const { data: webhooks = [], isLoading } = useWebhooks();
  const updateWebhooks = useUpdateWebhooks();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const handleToggle = (id: string) => {
    const updated = webhooks.map((w: any) => {
      if (w.id === id) {
        const nextStatus = w.status === "active" ? "inactive" : "active";
        toast.success(`Webhook status set to ${nextStatus}.`);
        return { ...w, status: nextStatus };
      }
      return w;
    });
    updateWebhooks.mutate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = webhooks.filter((w: any) => w.id !== id);
    updateWebhooks.mutate(updated, {
      onSuccess: () => {
        toast.success("Webhook deleted successfully.");
      }
    });
  };

  const handleOpenConfigure = (w: Webhook) => {
    setSelectedWebhook(w);
    setIsConfigModalOpen(true);
  };

  const handleConfigureSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("url") as string;
    const retryCount = Number(formData.get("retryCount"));

    const updated = webhooks.map((w: any) => {
      if (w.id === selectedWebhook?.id) {
        return { ...w, url, retryCount };
      }
      return w;
    });

    updateWebhooks.mutate(updated, {
      onSuccess: () => {
        toast.success("Webhook configuration updated.");
        setIsConfigModalOpen(false);
      }
    });
  };

  const columns = [
    {
      header: "Event",
      accessor: (row: Webhook) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground font-semibold">{row.event}</code>
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
          <Button variant="ghost" size="icon" onClick={() => handleOpenConfigure(row)} title="Configure"><Settings className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleToggle(row.id)} title="Toggle Status"><Power className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AppTable columns={columns} data={webhooks} isLoading={isLoading} />

      {/* Configure Modal */}
      {isConfigModalOpen && selectedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Configure Webhook</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleConfigureSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Endpoint URL</label>
                <input required type="url" name="url" defaultValue={selectedWebhook.url} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Max Retries</label>
                <input required type="number" min="0" max="10" name="retryCount" defaultValue={selectedWebhook.retryCount} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsConfigModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Configurations</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
