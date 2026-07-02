"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useHl7Fhir, useUpdateHl7Fhir } from "@/features/integrations/hooks/use-integrations";
import { Hl7FhirConfig } from "@/features/integrations/types/integrations.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings, X, Power } from "lucide-react";
import { toast } from "sonner";

export default function Hl7FhirPage() {
  const { data: configs = [], isLoading } = useHl7Fhir();
  const updateHl7 = useUpdateHl7Fhir();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4 mt-6">
          {[1, 2].map(i => <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      </PageContainer>
    );
  }

  const handleToggle = (configId: string) => {
    const updated = configs.map((c: any) => {
      if (c.id === configId) {
        const nextStatus = c.status === "active" ? "inactive" : "active";
        toast.success(`Endpoint status set to ${nextStatus}.`);
        return { ...c, status: nextStatus };
      }
      return c;
    });
    updateHl7.mutate(updated);
  };

  const handleOpenConfigure = (c: Hl7FhirConfig) => {
    setSelectedConfig(c);
    setIsConfigModalOpen(true);
  };

  const handleConfigureSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const endpointUrl = formData.get("endpointUrl") as string;
    const version = formData.get("version") as string;

    const updated = configs.map((c: any) => {
      if (c.id === selectedConfig.id) {
        return { ...c, endpointUrl, version };
      }
      return c;
    });

    updateHl7.mutate(updated, {
      onSuccess: () => {
        toast.success("Interoperability configurations saved.");
        setIsConfigModalOpen(false);
      }
    });
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const standard = formData.get("standard") as any;
    const endpointUrl = formData.get("endpointUrl") as string;
    const version = formData.get("version") as string;
    const authentication = formData.get("authentication") as any;

    const newConfig: Hl7FhirConfig = {
      id: `hl7-${Date.now()}`,
      name,
      standard,
      endpointUrl,
      version,
      authentication,
      status: "active",
      lastPing: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    updateHl7.mutate([...configs, newConfig], {
      onSuccess: () => {
        toast.success("Interoperability endpoint created successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="HL7 / FHIR"
        description="Manage healthcare interoperability standards and endpoints"
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Endpoint</Button>}
      />
      <div className="space-y-4 mt-6">
        {configs.map((config: Hl7FhirConfig) => (
          <div key={config.id} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{config.name}</h3>
                <p className="text-sm text-muted-foreground">{config.standard} — Version {config.version}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={config.status} />
                <Button variant="ghost" size="icon" onClick={() => handleToggle(config.id)} title="Toggle status"><Power className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleOpenConfigure(config)} title="Configure"><Settings className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Endpoint URL</p>
                <code className="text-xs font-mono text-foreground break-all">{config.endpointUrl}</code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Authentication</p>
                <p className="text-sm font-medium capitalize text-foreground">{config.authentication}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Standard</p>
                <p className="text-sm font-medium text-foreground">{config.standard}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Ping</p>
                <p className="text-sm font-medium text-foreground">{config.lastPing ? new Date(config.lastPing).toLocaleTimeString() : "N/A"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Add Interoperability Endpoint</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Endpoint Name</label>
                <input required type="text" name="name" placeholder="e.g. Mayo Clinic API" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Standard Type</label>
                <select name="standard" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="FHIR R4">FHIR R4</option>
                  <option value="HL7">HL7 v2.x/v3</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Endpoint URL</label>
                <input required type="text" name="endpointUrl" placeholder="https://fhir.hospital.com/r4" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Standard Version</label>
                <input required type="text" name="version" placeholder="e.g. R4 (4.0.1) or v2.5" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Authentication</label>
                <select name="authentication" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="basic">Basic Auth</option>
                  <option value="apikey">API Key Header</option>
                </select>
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Endpoint</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Modal */}
      {isConfigModalOpen && selectedConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Configure {selectedConfig.name}</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleConfigureSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Endpoint URL</label>
                <input required type="text" name="endpointUrl" defaultValue={selectedConfig.endpointUrl} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Standard Version</label>
                <input required type="text" name="version" defaultValue={selectedConfig.version} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
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
