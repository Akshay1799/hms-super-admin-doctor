"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ProviderCard } from "@/features/integrations/components/ProviderCard";
import { useWhatsAppProviders, useUpdateWhatsAppProviders } from "@/features/integrations/hooks/use-integrations";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppProvidersPage() {
  const { data: providers = [], isLoading } = useWhatsAppProviders();
  const updateProviders = useUpdateWhatsAppProviders();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  if (isLoading) {
    return <PageContainer><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">{[1, 2, 3].map(i => <div key={i} className="h-52 rounded-xl bg-muted/40 animate-pulse" />)}</div></PageContainer>;
  }

  const handleToggle = (providerId: string) => {
    const updated = providers.map((p: any) => {
      if (p.id === providerId) {
        const nextStatus = p.status === "active" ? "inactive" : "active";
        toast.success(`Provider status set to ${nextStatus}.`);
        return { ...p, status: nextStatus };
      }
      return p;
    });
    updateProviders.mutate(updated);
  };

  const handleOpenConfigure = (p: any) => {
    setSelectedProvider(p);
    setIsConfigModalOpen(true);
  };

  const handleConfigureSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const environment = formData.get("environment") as any;
    const updated = providers.map((p: any) => {
      if (p.id === selectedProvider.id) {
        return { ...p, environment };
      }
      return p;
    });
    updateProviders.mutate(updated, {
      onSuccess: () => {
        toast.success("Provider configuration updated successfully.");
        setIsConfigModalOpen(false);
      }
    });
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const provider = formData.get("provider") as string;
    const environment = formData.get("environment") as any;

    const newProvider = {
      id: `wa-${Date.now()}`,
      provider,
      environment,
      status: "active" as const,
      messagesSentToday: 0,
      createdAt: new Date().toISOString(),
    };

    updateProviders.mutate([...providers, newProvider], {
      onSuccess: () => {
        toast.success("New WhatsApp provider added successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="WhatsApp Providers" 
        description="Configure WhatsApp Business API integrations" 
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Provider</Button>} 
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {providers.map((p: any) => (
          <ProviderCard 
            key={p.id} 
            name={p.provider === "meta-whatsapp" ? "Meta WhatsApp" : p.provider.charAt(0).toUpperCase() + p.provider.slice(1)} 
            provider={p.provider} 
            environment={p.environment} 
            status={p.status}
            meta={[{ label: "Messages Today", value: p.messagesSentToday.toLocaleString() }]} 
            onToggle={() => handleToggle(p.id)}
            onConfigure={() => handleOpenConfigure(p)}
          />
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Add WhatsApp Provider</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Provider Type</label>
                <select name="provider" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="meta-whatsapp">Meta Cloud API</option>
                  <option value="twilio">Twilio WhatsApp</option>
                  <option value="gupshup">Gupshup API</option>
                </select>
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
                <Button type="submit">Add Provider</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Modal */}
      {isConfigModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Configure {selectedProvider.provider.toUpperCase()}</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleConfigureSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Environment Target</label>
                <select name="environment" defaultValue={selectedProvider.environment} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsConfigModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Configurations</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
