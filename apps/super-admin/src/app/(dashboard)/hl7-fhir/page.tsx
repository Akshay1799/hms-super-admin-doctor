"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useHl7Fhir } from "@/features/integrations/hooks/use-integrations";
import { Hl7FhirConfig } from "@/features/integrations/types/integrations.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

export default function Hl7FhirPage() {
  const { data: configs = [], isLoading } = useHl7Fhir();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4 mt-6">
          {[1, 2].map(i => <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="HL7 / FHIR"
        description="Manage healthcare interoperability standards and endpoints"
        actions={<Button><Plus className="mr-2 h-4 w-4" />Add Endpoint</Button>}
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
                <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
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
    </PageContainer>
  );
}
