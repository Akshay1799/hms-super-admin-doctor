"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ApiKeyTable } from "@/features/integrations/components/ApiKeyTable";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useApiKeys, useUpdateApiKeys } from "@/features/integrations/hooks/use-integrations";
import { toast } from "sonner";
import { ApiKey } from "@/features/integrations/types/integrations.types";

export default function ApiKeysPage() {
  const { data: apiKeys = [] } = useApiKeys();
  const updateApiKeys = useUpdateApiKeys();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const service = formData.get("service") as string;
    const environment = formData.get("environment") as any;
    
    // Generate a masked key placeholder
    const rand = Math.random().toString(36).substring(7).toUpperCase();
    const keyMasked = `${service.toLowerCase().substring(0, 4)}_live_••••••••••••••••••••••••${rand}`;

    const newKey: ApiKey = {
      id: `ak-${Date.now()}`,
      service,
      environment,
      status: "active",
      keyMasked,
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    updateApiKeys.mutate([...apiKeys, newKey], {
      onSuccess: () => {
        toast.success("New API key generated successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="API Keys"
        description="Manage and rotate API credentials for all third-party integrations"
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Add API Key</Button>}
      />
      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5 font-medium">
          <span className="text-warning">⚠</span>
          Sensitive values are masked. Click the eye icon to reveal a key temporarily.
        </p>
        <ApiKeyTable />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Generate New API Key</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Service Name</label>
                <input required type="text" name="service" placeholder="e.g. AWS Rekognition" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Environment</label>
                <select name="environment" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Generate Key</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
