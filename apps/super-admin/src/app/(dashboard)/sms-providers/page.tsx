"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ProviderCard } from "@/features/integrations/components/ProviderCard";
import { useSmsProviders } from "@/features/integrations/hooks/use-integrations";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SmsProvidersPage() {
  const { data: providers = [], isLoading } = useSmsProviders();

  if (isLoading) {
    return <PageContainer><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">{[1, 2, 3].map(i => <div key={i} className="h-52 rounded-xl bg-muted/40 animate-pulse" />)}</div></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="SMS Providers" description="Configure SMS gateway integrations for patient and staff notifications" actions={<Button><Plus className="mr-2 h-4 w-4" />Add Provider</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {providers.map(p => (
          <ProviderCard key={p.id} name={p.provider.toUpperCase()} provider={p.provider} environment={p.environment} status={p.status}
            meta={[{ label: "SMS Sent Today", value: p.smsSentToday.toLocaleString() }]} />
        ))}
      </div>
    </PageContainer>
  );
}
