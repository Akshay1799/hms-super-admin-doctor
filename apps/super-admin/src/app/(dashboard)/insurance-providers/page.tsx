"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ProviderCard } from "@/features/integrations/components/ProviderCard";
import { useInsuranceProviders } from "@/features/integrations/hooks/use-integrations";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InsuranceProvidersPage() {
  const { data: providers = [], isLoading } = useInsuranceProviders();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map(i => <div key={i} className="h-52 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Insurance Providers"
        description="Manage insurance integration endpoints for claim processing"
        actions={<Button><Plus className="mr-2 h-4 w-4" />Add Provider</Button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {providers.map(provider => (
          <ProviderCard
            key={provider.id}
            name={provider.name}
            provider={provider.type}
            environment="production"
            status={provider.status}
            meta={[
              { label: "Type", value: provider.type },
              { label: "Claims Count", value: provider.claimsCount.toLocaleString() },
              { label: "Success Rate", value: `${provider.successRate}%` },
            ]}
          />
        ))}
      </div>
    </PageContainer>
  );
}
