"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { WebhookTable } from "@/features/integrations/components/WebhookTable";
import { WebhookLogsTable } from "@/features/integrations/components/WebhookLogsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function WebhooksPage() {
  const [tab, setTab] = useState<"webhooks" | "logs">("webhooks");

  return (
    <PageContainer>
      <PageHeader
        title="Webhooks"
        description="Manage outbound webhooks and delivery logs"
        actions={
          <Button>
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
    </PageContainer>
  );
}
