"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { WebhookTable } from "@/features/integrations/components/WebhookTable";
import { WebhookLogsTable } from "@/features/integrations/components/WebhookLogsTable";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useWebhooks, useUpdateWebhooks } from "@/features/integrations/hooks/use-integrations";
import { toast } from "sonner";
import { Webhook } from "@/features/integrations/types/integrations.types";

export default function WebhooksPage() {
  const { data: webhooks = [] } = useWebhooks();
  const updateWebhooks = useUpdateWebhooks();
  
  const [tab, setTab] = useState<"webhooks" | "logs">("webhooks");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const event = formData.get("event") as string;
    const url = formData.get("url") as string;
    const method = formData.get("method") as any;

    const newWebhook: Webhook = {
      id: `wh-${Date.now()}`,
      event: event as any,
      url,
      method,
      status: "active",
      retryCount: 3,
      lastTriggered: new Date().toISOString(),
    };

    updateWebhooks.mutate([...webhooks, newWebhook], {
      onSuccess: () => {
        toast.success("Webhook endpoint registered successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Webhooks"
        description="Manage outbound webhooks and delivery logs"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        }
      />

      <div className="mt-6 space-y-4">
        <div className="flex gap-1 border-b border-border">
          {(["webhooks", "logs"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize relative transition-colors cursor-pointer ${
                tab === t
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "webhooks" ? "Configured Webhooks" : "Delivery Logs"}
            </button>
          ))}
        </div>

        {tab === "webhooks" ? <WebhookTable /> : <WebhookLogsTable />}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Register Outbound Webhook</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Event Trigger</label>
                <select name="event" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="patient.created">patient.created</option>
                  <option value="invoice.generated">invoice.generated</option>
                  <option value="claim.approved">claim.approved</option>
                  <option value="appointment.created">appointment.created</option>
                  <option value="tenant.created">tenant.created</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target URL</label>
                <input required type="url" name="url" placeholder="https://yourdomain.com/webhooks/listener" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">HTTP Method</label>
                <select name="method" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="POST">POST (Recommended)</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Webhook</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
